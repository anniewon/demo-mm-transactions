var gResourceRootUrl = location.protocol + '//' + location.hostname + '/content/transdemo/';

//-----------------------------------------------------------------------------

var tts_gender = "female";
var tts_locale = "en-US";

function getUrlVar(name) {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    if (hash[0] == name) {
      return hash[1];
    }
  }
  return null;
}

//-----------------------------------------------------------------------------

function load() {
  NativeBridge.onInitialize(nbInitialize);
}

function nbInitialize(o) {
  NativeBridge.log("gResourceRootUrl: " + gResourceRootUrl);
}

function emptyGrammarHandler(result) {
}

//-----------------------------------------------------------------------------

var mainmenu_prompted = false;
var mainmenu_reco_errors = 0;

function mainmenu_init() {
  mainmenu_reco_errors = 0;
  NativeBridge.setMessage("How can I help you?");
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/mainmenu.grxml", null, mainmenu_grammarHandler);
  if (!mainmenu_prompted) {
    NativeBridge.playTTS(tts_gender, tts_locale, "How can I help you?");
    mainmenu_prompted = true;
  }
}

function mainmenu_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("mainmenu_grammarHandler - interpretation: " + interp);
    if (interp == "recent charges" ||
        interp == "recent transactions") {
      mainmenu_reco_errors = 0;
      $.mobile.changePage($("#recent-transactions"));
/*
    } else if (/(recent charges since )(.*)/.test(str)) {
      // ex: recent charges since <the 24th of April>
      NativeBridge.log(RegExp.$2);
      mainmenu_reco_errors = 0;
      // TODO:
    } else if (/(recent charges from )(.*)/.test(str)) {
      // ex: recent charges from <Vons>
      NativeBridge.log(RegExp.$2);
      mainmenu_reco_errors = 0;
      // TODO:
*/
    } else if (interp == "contact us" ||
               interp == "find an a t m" ||
               interp == "report a lost card" ||
               interp == "report a stolen card" ||
               interp == "make a payment" ||
               interp == "rewards points") {
      // not implemented
      NativeBridge.log("mainmenu_grammarHandler - not implemented");
      mainmenu_reco_errors++;
    } else if (interp == "help" || interp == "agent") {
      mainmenu_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    } else {
      mainmenu_reco_errors++;
      NativeBridge.log("mainmenu_grammarHandler - Bad input:" + interp + ".");
    }
  } else {
    mainmenu_reco_errors++;
    NativeBridge.log("mainmenu_grammarHandler - No input.");
  }

  NativeBridge.log("mainmenu_grammarHandler - mainmenu_reco_errors: " + mainmenu_reco_errors);
  if (mainmenu_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/mainmenu.grxml", null, mainmenu_grammarHandler);
  }
}

//-----------------------------------------------------------------------------

var recenttransactions_prompted = false;
var recenttransactions_reco_errors = 0;

function recenttransactions_init() {
  recenttransactions_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/recenttransactions.grxml", null, recenttransactions_grammarHandler);
  if (!recenttransactions_prompted) {
    NativeBridge.playTTS(tts_gender, tts_locale, "Here are your recent transactions. You can say things like Sort by Date or show charges since April 25th.");
    recenttransactions_prompted = true;
  }
}

function recenttransactions_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("recenttransactions_grammarHandler - interpretation: " + interp);
    if (interp == "help" || interp == "agent") {
      recenttransactions_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    //} else if () {  // TODO:
    } else {
      recenttransactions_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - Bad input:" + interp + ".");
    }
  } else {
    recenttransactions_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - No input.");
  }

  NativeBridge.log("recenttransactions_grammarHandler - recenttransactions_reco_errors: " + 
    recenttransactions_reco_errors);
  if (recenttransactions_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/recenttransactions.grxml", null, recenttransactions_grammarHandler);
    if (recenttransactions_reco_errors == 1) {      
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, one more time please.");
    } else {
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, you can say things like Sort by Date  or show charges since April 25th.");
    }
  }
}

//-----------------------------------------------------------------------------

var transactiondetail_prompted = false;
var transactiondetail_reco_errors = 0;

function transactiondetail_init() {
  var cc_number = getUrlVar("cc_number");
  var transaction_id = getUrlVar("transaction_id");
  AccountData.account.initDropdown("last-4-digits-detail", g_acct_number, cc_number, null);
  AccountData.transactions.displayTransaction(cc_number, transaction_id);
  $("#dispute-button").attr("href", "#dispute?cc_number=" + cc_number + "&transaction_id=" + transaction_id);

  transactiondetail_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
  if (!transactiondetail_prompted) {
    NativeBridge.playTTS(tts_gender, tts_locale, "Here are the details. You can say Dispute this charge or Go back");
    transactiondetail_prompted = true;
  }
}

function transactiondetail_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("transactiondetail_grammarHandler - interpretation: " + interp);
    if (interp == "dispute this charge") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#dispute"));
    } else if (interp == "next charge") {
      transactiondetail_reco_errors = 0;
      // TODO:
    } else if (interp == "previous charge") {
      transactiondetail_reco_errors = 0;
      // TODO:
    } else if (interp == "go back") {
      transactiondetail_reco_errors = 0;
      history.back();
    } else if (interp == "help" || interp == "agent") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    } else {
      transactiondetail_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - Bad input:" + interp + ".");
    }
  } else {
    transactiondetail_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - No input.");
  }

  NativeBridge.log("transactiondetail_grammarHandler - transactiondetail_reco_errors: " + transactiondetail_reco_errors);
  if (transactiondetail_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
    if (transactiondetail_reco_errors == 1) {      
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, one more time please.");
    } else {
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, you can say Dispute this charge or Go back");
    }
  }
}

//-----------------------------------------------------------------------------

var survey_reco_errors = 0;

function dispute_init() {
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(null, null, dispute_grammarHandler);

  var cc_number = getUrlVar("cc_number");
  AccountData.account.initDropdown("last-4-digits-dispute", g_acct_number, cc_number, null);
}

function dispute_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("dispute_grammarHandler - interpretation: " + interp);
    if (interp == "back to list") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#recent-transactions"));
    } else if (interp == "main menu" || interp == "start over") {        
      dispute_reco_errors = 0;
      $.mobile.changePage($("#main-menu"));
    } else if (interp == "continue") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#survey"));
    } else if (interp == "help" || interp == "agent") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    } else {
      dispute_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - Bad input:" + interp + ".");
    }
  } else {
    dispute_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - No input.");
  }

  NativeBridge.log("dispute_grammarHandler - dispute_reco_errors: " + dispute_reco_errors);
  if (dispute_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/dispute.grxml", null, dispute_grammarHandler);
  }
}

//-----------------------------------------------------------------------------

var survey_reco_errors = 0;

function survey_init() {
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(null, null, survey_grammarHandler);
}

function survey_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("survey_grammarHandler - interpretation: " + interp);
    if (interp == "main menu" || interp == "start over") {        
      survey_reco_errors = 0;
      $.mobile.changePage($("#main-menu"));
    } else if (interp == "submit") {
      // TODO:
      survey_reco_errors = 0;
    } else if (interp == "help" || interp == "agent") {
      survey_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    } else {
      survey_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - Bad input:" + interp + ".");
    }
  } else {
    survey_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - No input.");
  }

  NativeBridge.log("survey_grammarHandler - survey_reco_errors: " + survey_reco_errors);
  if (survey_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/survey.grxml", null, survey_grammarHandler);
  }
}

function survey_doStar(vid){
  if (vid == 0 && !$('li > span').hasClass('star-act')) {
    if ($('#s-'+vid).hasClass('star')) {
      $('#s-'+vid).removeClass('star').addClass('star-act');
    } else {
      $('#s-'+vid).removeClass('star-act').addClass('star');
    }
  } else {
    for (var i = vid; i < 5; i++) {
      if ($('#s-'+i).hasClass('star-act')) {
        $('#s-'+i).removeClass('star-act').addClass('star');
      }
    }
    for (var i = 0; i < 5; i++){
      $('#s-'+i).removeClass('star').addClass('star-act');
      if (i == vid) {
        break;
      }
    }
  }
}

//-----------------------------------------------------------------------------

function chat_init() {
  // TODO: How can I help you with <this charge from April 25th at Vons>? 
  NativeBridge.setMessage("How can I help you with your recent charges?");
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);
}
