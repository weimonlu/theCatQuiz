
// global variables

// track the current question that the user is on
let questionNumber = 0;
// track the answers that the user selects
const userAnswers = [];
// set of questions, to be read from json file
let questionSet = null;
// set of cats, to be read from json file
let catSet = null;
// key = cat, value = score
const catMap = new Map();


/**
 * randomly selects a cat from the given array, returned cat will be the cat presented to the user
 * @param (array) cats who have highest score
 */
function getRandomCat(catChoices) {
	const randNum = Math.floor(Math.random() * catChoices.length)
	const cat = catChoices[randNum];
	return cat;
}


/**
 * Clears current question, displays the next question
 * If it's the last question, remove the Next button from the UI and show the Calculate button, which will show user the results
 * First call comes from the Start function, subsequent calls come from user clicking the Next button
 */
function nextQuestion() {
	
	const questionDiv = document.getElementById("questionsContainer");
	const answersDiv = document.getElementById("answersContainer");

	// get next question
	const currentQuestion = questionSet[questionNumber];

	// clear previous question
	questionDiv.innerHTML = "";
	answersDiv.innerHTML = "";

	// show new question
	questionDiv.appendChild(document.createTextNode(currentQuestion.Question));

	// show answer choices
	for (let i = 0; i < currentQuestion.Answers.length; i++) {
		answersDiv.insertAdjacentHTML('beforeend', "<p>"+currentQuestion.Answers[i]+"</p>");
	}


	questionNumber += 1;

	// toggle next button off until user selects an option
	toggleNextButton();

	// show calculate button if there are no more questions
	if (questionNumber == questionSet.length) {
		document.getElementById("nextButton").style.display = 'none';
		document.getElementById("calculateButton").style.display = "block";
	}
}

/**
 * Toggles whether the Next button is diabled, 
 * as we don't want the user to go to the next question without selecting an anser for current question
 */ 
function toggleNextButton() {

	// if disabled, enable; if enabled, disable
	console.log("disabled button?", document.getElementById("nextButton").disabled);
	if (document.getElementById("nextButton").disabled) {
		document.getElementById("nextButton").disabled = false;
	} else {
		document.getElementById("nextButton").disabled = true;
	}
}


/**
 * Controls UI when user selects an answer.
 * Selected answer will have pink background.
 * Next button will allow user to proceed once answer is selected.
 * @param user click event
 */ 
function selectAnswer(event) {

	let ans = event.target.innerHTML;
	const strAns = new String(ans);
	const pElements = document.querySelectorAll("p");
	

	// remove any background selections if user changes answer
	for (p of pElements) {
		p.style.backgroundColor = '';
	}

	// only select background if user selects text within p element
	// ensures that if the user clicks on div element, the whole div isn't highlighted
	if (strAns.slice(0, 2) != "<p") {
		event.target.style.background = 'pink';
		// adds user's answer to array, overwrites previous answer if user changes choice
		userAnswers[questionNumber - 1] = ans;
		document.getElementById("nextButton").disabled = false;
	} 
	// if user selects the whole div, toggle next button off so they can't proceed
	else {
		document.getElementById("nextButton").disabled = true;
	}
}

/**
 * Gets cat name from Json file and adds each cat to the catMap to keep scores
 */ 
async function getCatNames() {

	// get list of cats from json
	const requestURLCats = "https://raw.githubusercontent.com/weimonlu/coursera-test/main/catSelection.json";
 	const requestCats = new Request(requestURLCats);
 	const responseCats = await fetch(requestCats);
 	catSet = await responseCats.json();

 	// add cats to catMap, set score to 0
	for (let i = 0; i < catSet.length; i++) {
		catMap.set(catSet[i].cat, 0);
	}
}

/**
 * Called when user clicks the Calculate button
 * Calculates each cat's score
 */ 
function calculateResults() {
	
	// for each answer that user selected, see if it matches cat's answer and increase score
	for (ans of userAnswers) {
		for (c of catSet) {
			if (c.choices.includes(ans)) {
				catMap.set(c.cat, catMap.get(c.cat) + 1);
			}
		}
	}

	// show results
	showResults();
}

/**
 * Once user has finished quiz, show the cat the user is most like
 */ 
function showResults() {
	let curMax = 0;
	const maxCats = []

	// clear out current UI contents
	document.getElementById("questionsContainer").style.display = 'none';
	document.getElementById("answersContainer").style.display = 'none';
	document.getElementById("calculateButton").style.display = 'none';

	// find cat(s) with highest score
	for (const [key, value] of catMap) {
		if (value > curMax) {
			curMax = value;
			// emtpy array if there's a new max
			maxCats.splice(0, maxCats.length);
			maxCats.push(key);
		}
		else if (value == curMax) {
			// if there's a tie, add cat to array
			maxCats.push(key);
		}
	}

	// for cats with highest score, pick random cat
	const finalCat = getRandomCat(maxCats);

	// get info and show results
	const resultsDiv = document.getElementById("results");
	const [finalImg, finalBio] = getCatInfo(finalCat);
	resultsDiv.insertAdjacentHTML('beforeend', "<div class = 'row'><img id = 'catPicture' src =" + finalImg + "></div>");
	resultsDiv.insertAdjacentHTML('beforeend', "<div class = 'row' id = catName>" + finalCat + "</div>");
	resultsDiv.insertAdjacentHTML('beforeend', "<d id = 'catBio'>Congratulations! You are " + finalCat + "! " + finalBio + "</div>");	
}

/**
 * searches through catSet to return the selected cat's image and bio
 * @return array of cat's image and cat's bio
 */ 
function getCatInfo(catName) {
	for (c of catSet) {
		if (c.cat === catName)
			return [c.img, c.bio];
	}
	return ["" ,""];
}


/**
 * starts the quiz, called when user clicks the Start button
 */ 
async function start() {


	// hide start button and intro
	document.getElementById("start-button").style.display = "none";
	document.getElementById("introText").style.display = "none";

	// get questions from github
	const requestURL = "https://raw.githubusercontent.com/weimonlu/coursera-test/main/questions.json";
	const request = new Request(requestURL);
	const response = await fetch(request);
  	questionSet = await response.json();

	const numberOfQuestions = Object.keys(questionSet).length;
	const answersDiv = document.getElementById("answersContainer");
	const answer = document.querySelector("p");
	const nextButton = document.getElementById("nextButton");

	// make the Next button visible
	nextButton.style.display = 'block';
	document.getElementById("nextButton").disabled = false;

	// show the first question
	nextQuestion(questionSet[0]);
	answersDiv.addEventListener('click', selectAnswer);

	getCatNames();
	
}
