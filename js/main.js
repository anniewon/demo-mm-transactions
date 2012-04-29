
var gDynamicGrammarRootUrl = "../../perl/transdemo/grammars/dynamicgram.pl";
var gMerchantDelim = "<DELIM>";

//-----------------------------------------------------------------------------

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

function merchants() {
  //TODO:
  var merchants =
    "Starbucks" + gMerchantDelim +
    "Quiznos" + gMerchantDelim +
    "Safeway" + gMerchantDelim +
    "Walgreens" + gMerchantDelim +
    "Chevron" + gMerchantDelim +
    "Lou Malnati's" + gMerchantDelim +
    "Hotel Burnham" + gMerchantDelim +
    "Elmwood Cafe" + gMerchantDelim +
    "C &amp; C Cleaners" + gMerchantDelim +
    "Amazon.com" + gMerchantDelim +
    "San Francisco Museum of Modern Art" + gMerchantDelim +
    "Le Charm French Bistro" + gMerchantDelim +
    "Netflix" + gMerchantDelim +
    "Alameda 76" + gMerchantDelim +
    "Otaez Mexican Restaurant" + gMerchantDelim +
    "United Airlines" + gMerchantDelim +
    "Macys" + gMerchantDelim +
    "FasTrak" + gMerchantDelim +
    "Comcast" + gMerchantDelim +
    "Verizon Wireless" + gMerchantDelim +
    "esurance" + gMerchantDelim +
    "Alameda Auto Body";
  return encodeURIComponent(merchants);
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

var mainmenu_prompted = false;
var mainmenu_reco_errors = 0;

function mainmenu_grammar() {
  return gDynamicGrammarRootUrl + "?type=mainmenu&merchants=" + merchants();
}

function mainmenu_show() {
  mainmenu_reco_errors = 0;
  NativeBridge.setMessage("How can I help you?");
  NativeBridge.setGrammar(mainmenu_grammar(), null, mainmenu_grammarHandler);
  if (!mainmenu_prompted) {
    NativeBridge.playAudio("audio/RT_Menu_01.wav");
    mainmenu_prompted = true;
  }
}

function mainmenu_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    var action = interp.action.toLowerCase();
    NativeBridge.log("mainmenu_grammarHandler - reco result: " + action);

    // TODO:
    if (action == "recent transactions") {        
      mainmenu_reco_errors = 0;
      $.mobile.changePage($("#recent-transactions"));

    } else if (action == "filter") {
      NativeBridge.log("mainmenu_grammarHandler - filter" +
                       ", field: " + interp.field + 
                       ", comparison: " + interp.comparison +
                       ", value: " + interp.value);

      if (interp.field.toLowerCase() == "date") {
        var date = new Date(parseFloat(interp.value));
        NativeBridge.log("mainmenu_grammarHandler - date: " + date.toLocaleString());
      }

      mainmenu_reco_errors = 0;
      NativeBridge.setGrammar(mainmenu_grammar(), null, mainmenu_grammarHandler);

    } else if (action == "payment" ||
               action == "atm" ||
               action == "rewards" ||
               action == "contact" ||
               action == "report missing") {
      NativeBridge.log("mainmenu_grammarHandler - not implemented");
      mainmenu_reco_errors++;

    } else if (action == "chat") {
      mainmenu_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      mainmenu_reco_errors++;
      NativeBridge.log("mainmenu_grammarHandler - unhandled:" + action + ".");
    }
  } else {
    mainmenu_reco_errors++;
    NativeBridge.log("mainmenu_grammarHandler - no reco result.");
  }

  NativeBridge.log("mainmenu_grammarHandler - mainmenu_reco_errors: " + mainmenu_reco_errors);
  if (mainmenu_reco_errors > 0) {
    NativeBridge.setGrammar(mainmenu_grammar(), null, mainmenu_grammarHandler);
  }
}

//-----------------------------------------------------------------------------

var recenttransactions_prompted = false;
var recenttransactions_reco_errors = 0;

function recenttransactions_grammar() {
  return gDynamicGrammarRootUrl + "?type=recenttransactions&merchants=" + merchants();
}

function recenttransactions_beforeshow() {
  recenttransactions_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(recenttransactions_grammar(), null, recenttransactions_grammarHandler);
}

function recenttransactions_show() {
  if (!recenttransactions_prompted) {
    NativeBridge.playAudio("audio/RT_RecentTransactions_01.wav");
    
    recenttransactions_prompted = true;
  }
}

function recenttransactions_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    var action = interp.action.toLowerCase();
    NativeBridge.log("recenttransactions_grammarHandler - reco result: " + action);

    // TODO:
    if (action == "sort") {
      NativeBridge.log("recenttransactions_grammarHandler - sort" +
                       ", field: " + interp.field + 
                       ", order: " + interp.order);
      
      recenttransactions_reco_errors = 0;
      NativeBridge.setGrammar(recenttransactions_grammar(), null, recenttransactions_grammarHandler);

    } else if (action == "filter") {
      NativeBridge.log("recenttransactions_grammarHandler - filter" +
                       ", field: " + interp.field + 
                       ", comparison: " + interp.comparison +
                       ", value: " + interp.value);

      if (interp.field.toLowerCase() == "date") {
        var date = new Date(parseFloat(interp.value));
        NativeBridge.log("recenttransactions_grammarHandler - date: " + date.toLocaleString());
      }

      recenttransactions_reco_errors = 0;
      NativeBridge.setGrammar(recenttransactions_grammar(), null, recenttransactions_grammarHandler);

    } else if (action == "detail") {
      NativeBridge.log("recenttransactions_grammarHandler - detail" +
                       ", idx: " + interp.idx);

      recenttransactions_reco_errors = 0;
      NativeBridge.setGrammar(recenttransactions_grammar(), null, recenttransactions_grammarHandler);

    } else if (action == "chat") {
      recenttransactions_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      recenttransactions_reco_errors++;
      NativeBridge.log("recenttransactions_grammarHandler - unhandled:" + action + ".");
    }
  } else {
    recenttransactions_reco_errors++;
    NativeBridge.log("recenttransactions_grammarHandler - no reco result.");
  }

  NativeBridge.log("recenttransactions_grammarHandler - recenttransactions_reco_errors: " + recenttransactions_reco_errors);
  if (recenttransactions_reco_errors > 0) {
    NativeBridge.setGrammar(recenttransactions_grammar(), null, recenttransactions_grammarHandler);
    if (recenttransactions_reco_errors == 1) {
      NativeBridge.playAudio("audio/RT_RecentTransactions_02.wav");
    } else {
      NativeBridge.playAudio("audio/RT_RecentTransactions_03.wav");
    }
  }
}

//-----------------------------------------------------------------------------

var transactiondetail_prompted = false;
var transactiondetail_reco_errors = 0;

function transactiondetail_beforeshow() {
  var cc_number = getUrlVar("cc_number");
  var transaction_id = getUrlVar("transaction_id");
  AccountData.account.initDropdown("last-4-digits-detail", g_acct_number, cc_number, null);
  AccountData.transactions.displayTransaction(cc_number, transaction_id);
  $("#dispute-button").attr("href", "#dispute?cc_number=" + cc_number + "&transaction_id=" + transaction_id);

  transactiondetail_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar("grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
}

function transactiondetail_show() {
  if (!transactiondetail_prompted) {
    NativeBridge.playAudio("audio/RT_TransactionDetails_01.wav");
    transactiondetail_prompted = true;
  }
}

function transactiondetail_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation.toLowerCase();
    NativeBridge.log("transactiondetail_grammarHandler - reco result: " + interp);

    if (interp == "dispute") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#dispute"));

    } else if (interp == "next") {
      transactiondetail_reco_errors = 0;
      NativeBridge.setGrammar("grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
      // TODO:

    } else if (interp == "previous") {
      transactiondetail_reco_errors = 0;
      NativeBridge.setGrammar("grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
      // TODO:

    } else if (interp == "go back") {
      transactiondetail_reco_errors = 0;
      history.back();

    } else if (interp == "chat") {
      transactiondetail_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      transactiondetail_reco_errors++;
      NativeBridge.log("transactiondetail_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    transactiondetail_reco_errors++;
    NativeBridge.log("transactiondetail_grammarHandler - no reco result.");
  }

  NativeBridge.log("transactiondetail_grammarHandler - transactiondetail_reco_errors: " + transactiondetail_reco_errors);
  if (transactiondetail_reco_errors > 0) {
    NativeBridge.setGrammar("grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
    if (transactiondetail_reco_errors == 1) {
      NativeBridge.playAudio("audio/RT_TransactionDetails_02.wav");
    } else {
      NativeBridge.playAudio("audio/RT_TransactionDetails_03.wav");
    }
  }
}

//-----------------------------------------------------------------------------

var dispute_reco_errors = 0;

function dispute_beforeshow() {
  dispute_reco_errors = 0;
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar("grammars/dispute.grxml", null, dispute_grammarHandler);

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
      NativeBridge.log("dispute_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    dispute_reco_errors++;
    NativeBridge.log("dispute_grammarHandler - no reco result.");
  }

  NativeBridge.log("dispute_grammarHandler - dispute_reco_errors: " + dispute_reco_errors);
  if (dispute_reco_errors > 0) {
    NativeBridge.setGrammar("grammars/dispute.grxml", null, dispute_grammarHandler);
  }
}

//-----------------------------------------------------------------------------

var survey_reco_errors = 0;

function survey_beforeshow() {
  survey_reco_errors = 0;
  NativeBridge.setMessage(null);
  //NativeBridge.setGrammar("grammars/survey.grxml", null, survey_grammarHandler);
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);
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
      NativeBridge.log("survey_grammarHandler - not implemented");
      survey_reco_errors++;

    } else if (interp == "chat") {
      survey_reco_errors = 0;
      $.mobile.changePage($("#chat"));

    } else {
      survey_reco_errors++;
      NativeBridge.log("survey_grammarHandler - unhandled:" + interp + ".");
    }
  } else {
    survey_reco_errors++;
    NativeBridge.log("survey_grammarHandler - no reco result.");
  }

  NativeBridge.log("survey_grammarHandler - survey_reco_errors: " + survey_reco_errors);
  if (survey_reco_errors > 0) {
    NativeBridge.setGrammar("grammars/survey.grxml", null, survey_grammarHandler);
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

function chat_show() {
  NativeBridge.setMessage(null);
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);
}
