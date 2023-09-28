(function (global) {
  let ajaxUtils = {};

  // check if AJAX object is available
  function getRequestObject() {
    if (global.XMLHttpRequest) {
      return (new XMLHttpRequest());
    }

    else {
      return (null);
    }
  }

  ajaxUtils.sendGetRequest = function(requestURL, responseHandler, isJsonResponse) {
    let request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("GET", "https://weimonlu.com/projects/CatPersonalityTest/questions.json", true);
    request.send(null);
  };
  
  function handleResponse(request, responseHandler, isJsonResponse) {
    if ((request.readyState == 4) && (request.status == 200)) {
      if (isJsonResponse) {
        responseHandler(JSON.parse(request.responseText));
      } else {
        responseHandler(request.responseText);
      }
    }
  }

  global.$ajaxUtils = ajaxUtils;
})(window);