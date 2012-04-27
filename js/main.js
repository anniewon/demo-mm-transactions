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
    NativeBridge.log("mainmenu_grammarHandler - reco result: " + interp);

    // TODO:
    // Recent charges since <the 24th of April>
    // Recent charges from <Vons>

    if (interp == "recent transactions") {        
      mainmenu_reco_errors = 0;
      $.mobile.changePage($("#recent-transactions"));

    } else if (interp == "make a payment" ||
               interp == "find an a t m" ||
               interp == "rewards points" ||
               interp == "contact us" ||
               interp == "report missing") {     
      // not implemented
      NativeBridge.log("mainmenu_grammarHandler - not implemented");
      mainmenu_reco_errors++;

    } else if (interp == "chat") {
      mainmenu_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      mainmenu_reco_errors++;
      NativeBridge.log("mainmenu_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    mainmenu_reco_errors++;
    NativeBridge.log("mainmenu_grammarHandler - no reco result.");
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
    NativeBridge.log("recenttransactions_grammarHandler - reco result: " + interp);

    // TODO:
    // Sort by Date starting with the newest 
    // Sort by date starting with the oldest
    // Show charges since the <25th>
    // Show charges since the <25th of April>
    // Show charges since <Monday, the 25th>
    // Show charges since <Monday>
    // Show charges from <Vons>
    // Show charges more than <$100>
    // Show charges less than <$200>
    // Show details of <the first one>
    // Show details of <the first charge>

    if (interp == "chat") {
      recenttransactions_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      recenttransactions_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    recenttransactions_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - no reco result.");
  }

  NativeBridge.log("recenttransactions_grammarHandler - recenttransactions_reco_errors: " + recenttransactions_reco_errors);
  if (recenttransactions_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/recenttransactions.grxml", null, recenttransactions_grammarHandler);
    if (recenttransactions_reco_errors == 1) {      
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, one more time please.");
    } else {
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, you can say things like Sort by Date or show charges since April 25th.");
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
    NativeBridge.log("transactiondetail_grammarHandler - reco result: " + interp);

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

    } else if (interp == "chat") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      transactiondetail_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    transactiondetail_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - no reco result.");
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

var dispute_reco_errors = 0;

function dispute_init() {
  dispute_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/dispute.grxml", null, dispute_grammarHandler);

  var cc_number = getUrlVar("cc_number");
  AccountData.account.initDropdown("last-4-digits-dispute", g_acct_number, cc_number, null);
}

function dispute_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("dispute_grammarHandler - reco result: " + interp);

    if (interp == "back to list") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#recent-transactions"));

    } else if (interp == "main menu") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#main-menu"));

    } else if (interp == "continue") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#survey"));

    } else if (interp == "chat") {
      dispute_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      dispute_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    dispute_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - no reco result.");
  }

  NativeBridge.log("dispute_grammarHandler - dispute_reco_errors: " + dispute_reco_errors);
  if (dispute_reco_errors > 0) {
    NativeBridge.setGrammar(gResourceRootUrl + "grammars/dispute.grxml", null, dispute_grammarHandler);
  }
}

//-----------------------------------------------------------------------------

var survey_reco_errors = 0;

function survey_init() {
  survey_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/survey.grxml", null, survey_grammarHandler);
}

function survey_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("survey_grammarHandler - reco result: " + interp);

    if (interp == "main menu") {
      survey_reco_errors = 0;
      $.mobile.changePage($("#main-menu"));

    } else if (interp == "submit") {
      // TODO:
      // not implemented
      NativeBridge.log("survey_grammarHandler - not implemented");
      survey_reco_errors++;

    } else if (interp == "chat") {
      survey_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      survey_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    survey_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - no reco result.");
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
  //NativeBridge.setMessage("How can I help you with your recent charges?"); -- Too long!
  NativeBridge.setMessage("How can I help you?");
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);
}
