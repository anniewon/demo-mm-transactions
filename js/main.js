var gResourceRootUrl = location.protocol + '//' + location.hostname + "/247demo/transactions/";

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
}

function emptyGrammarHandler(result) {
}

//-----------------------------------------------------------------------------

function mainmenu_init() {
  NativeBridge.setMessage("How can I help you?");
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/mainmenu.grxml", null, mainmenu_grammarHandler);
  NativeBridge.playTTS(tts_gender, tts_locale, "How can I help you?");
}

function mainmenu_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    if (interp == "recent charges") {
      $.mobile.changePage($("#recent-transactions"));
    //} else if () {  // TODO:
    } else if (interp == "chat") {
      $.mobile.changePage($("#chat"));
    } else {
      alert("Bad input:" + interp + ".");
    }
  } else {
    alert("No input.");
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
    var interp = result[0].interpretation;
    if (interp == "chat") {
      recenttransactions_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    //} else if () {  // TODO:
    } else {
      recenttransactions_reco_errors++;
      alert("Bad input:" + interp + ".");
    }
  } else {
    recenttransactions_reco_errors++;
    alert("No input.");
  }

  if (recenttransactions_reco_errors > 0) {
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
    var interp = result[0].interpretation;
    if (interp == "Dispute this charge") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#dispute"));
    } else if (interp == "Next charge") {
      transactiondetail_reco_errors = 0;
      // TODO:
    } else if (interp == "Previous charge") {
      transactiondetail_reco_errors = 0;
      // TODO:
    } else if (interp == "Go back") {
      transactiondetail_reco_errors = 0;
      history.back();
    } else if (interp == "chat") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#chat"));
    } else {
      transactiondetail_reco_errors++;
      alert("Bad input:" + interp + ".");
    }
  } else {
    transactiondetail_reco_errors++;
    alert("No input.");
  }

  if (transactiondetail_reco_errors > 0) {
    if (transactiondetail_reco_errors == 1) {      
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, one more time please.");
    } else {
      NativeBridge.playTTS(tts_gender, tts_locale, "Sorry, you can say Dispute this charge or Go back");
    }
  }
}

//-----------------------------------------------------------------------------

function dispute_init() {
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);

  var cc_number = getUrlVar("cc_number");
  AccountData.account.initDropdown("last-4-digits-dispute", g_acct_number, cc_number, null);
}

//-----------------------------------------------------------------------------

function survey_init() {
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);
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