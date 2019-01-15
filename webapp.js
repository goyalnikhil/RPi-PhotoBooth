var shell = require('shelljs');
var http = require('http');
var url = require('url');

var htmlDocHeader = '<!DOCTYPE html>'
var startScrTag = '<script>';
var endScrTag = '</script>';

var googleIconSS = '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\n';

var styleTag = '<style>' +
                '.home-button { background-color: DodgerBlue; border: none; margin-left: 2px; color: white; padding: 12px 12px; align-items: center; font-size: 16px; cursor: pointer; }\n' +
                '.home-button:hover { background-color: RoyalBlue; }\n' +
                '.button { background-color: #398c3c; border: none; color: white; padding: 12px 12px; text-align: center; text-decoration: none; display: inline-block; margin: 4px 2px; cursor: pointer; font-size: 16px; } \n' +
                '.red-button { background-color: #b13931;}\n' +
                'input[type=submit] { background-color: #4CAF50; border: none; color: white; padding: 16px 32px; text-decoration: none; margin: 4px 2px; cursor: pointer; font-size: 16px; }\n' +
                'input[type=number] { width: 295px; padding: 12px 20px; margin: 8px 0; box-sizing: border-box; border: none; background-color: #3CBC8D; color: white; }\n' +
                'button i.material-icons { vertical-align: middle; padding-right: 10px; margin-right: 10px; border-right: 1px groove; }' +
               '</style>';

var xhttpFunc = 'function callScript(url, cbFunc) { ' +
              ' var xhttp; xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.readyState == 4 && this.status == 200) cbFunc(); }; xhttp.open("GET", url, false); xhttp.send(); };\n';

var printTimeFunc = 'function printTime(sec) { ' +
                    'var d = new Date(); var nd = new Date(d.getTime() + sec * 1000); document.getElementById("timerLable").innerHTML = "Picture will click at every " + sec + " secs, starting at " + nd.toLocaleTimeString(); }\n';

var printCancleTimerFunc = 'function printCancleTimer() { ' +
                           'document.getElementById("timerLable").innerHTML = "Stopped clicking picture." }\n';

var backHomeButton = '<br><br><a href="/"><button class="home-button" type="button"><i class="material-icons">home</i>Home</button></a>';

var contentMap = {
  '/'       : htmlDocHeader + googleIconSS + styleTag + '<h1>Welcome to the Photo booth!</h1><br><a href="/input"><button class="home-button"><i class="material-icons">photo</i>Single click mode</button></a><a href="/timer"><button class="home-button"><i class="material-icons">burst_mode</i>Burst click mode</button></a>',

  '/timer'  : htmlDocHeader + googleIconSS + styleTag + '<h1>Burst picture mode...</h1><br>' + startScrTag + xhttpFunc + printCancleTimerFunc + printTimeFunc + endScrTag +
              '<p id="timerLable">Set the time in seconds for the timer and hit \'Set Timer\' button. Hit \'Stop Timer\' button to stop the burst mode.</p>' +
              '<form action="javascript:printTime(timerVal.value); callScript(\'/burst?timer=\' + timerVal.value, function() {})"><input type="number" value="30" id="timerVal" name="timerVal"></input><br><button class="button" type="submit"><i class="material-icons">timer</i>Set Timer</button></input>' +
              '<button class="button red-button" type="button" onClick="printCancleTimer(); callScript(\'/cancleBurst\', function() {})"><i class="material-icons">timer_off</i>Stop Timer</button></form><br>' + backHomeButton,
 
  '/input' : htmlDocHeader + googleIconSS + styleTag + '<h1>Single click picture mode...</h1>' + startScrTag + xhttpFunc + endScrTag  + 
              '<button class="button" type="button" onClick="callScript(\'/clickit\', function() { alert(\'Picture clicked!!!\') })" autofocus><i class="material-icons">photo_camera</i>Take Picture!</button><br>' + backHomeButton,

  '/help'  : htmlDocHeader + '<h1>Welcome to the help page</h1>' + backHomeButton,
}

var timerObj;

http.createServer(onRequest).listen(8888);
console.log('Server has started at port : 8888');

function onRequest(request, response) {
  var parsedURL = url.parse(request.url, true); 
  var pathName = parsedURL.pathname;
  var queryParams = parsedURL.query;
  console.log('pathname : ' + pathName);
  showPage(response, pathName, queryParams);
};


function showPage(response, pathName, queryParams) {
  if (pathName === '/clickit') {
    clickPic();
    response.end();
    return;
  }
  if (pathName === '/burst') {
    if (timerObj) {
      clearInterval(timerObj);
    }
    console.log('setting timer interval at ' + queryParams.timer + ' sec.');
    timerObj = setInterval(clickPic, queryParams.timer * 1000);
    response.end();
    return;
  }
  if (pathName === '/cancleBurst') {
    clearInterval(timerObj);
    response.end();
    return;
  }
  if(contentMap[pathName]){
    response.writeHead(200, {'Content-Type': 'text/html'})
    response.write(contentMap[pathName]);
    response.end();
  } else {
    response.writeHead(404, {'Content-Type': 'text/html'})
    response.write('404 Page not found');
    response.end();
  }
}

function clickPic() {
  if (shell.exec('raspistill -n -t 200 -w 512 -h 384 -o - | lp').code !== 0 ) {
    console.log('failed executing dir');
  }
}