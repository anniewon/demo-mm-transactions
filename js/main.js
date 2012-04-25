var gResourceRootUrl = location.protocol + '//' + location.hostname + "/247demo/transactions/";

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

//-----------------------------------------------------------------------------

function load() {
  NativeBridge.onInitialize(nbInitialize);
  NativeBridge.setMessage("What can I help you with?");
  NativeBridge.setGrammar(null, null, emptyGrammarHandler);
}

function nbInitialize(o) {
}

function emptyGrammarHandler(result) {
}

//-----------------------------------------------------------------------------

function recenttransactions_init() {
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/recenttransactions.grxml", null, recenttransactions_grammarHandler);
}

function recenttransactions_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    if (interp == "back") {
      history.back();
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

function transactiondetail_init() {
  var cc_number = getUrlVar("cc_number");
  var transaction_id = getUrlVar("transaction_id");
  AccountData.account.initDropdown("last-4-digits-detail", g_acct_number, cc_number, null);
  AccountData.transactions.displayTransaction(cc_number, transaction_id);
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/transactiondetail.grxml", null, transactiondetail_grammarHandler);
}

function transactiondetail_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    if (interp == "dispute") {
      $.mobile.changePage($("#dispute"));
    } else if (interp == "back") {
      history.back();
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

function dispute_init() {
  var cc_number = getUrlVar("cc_number");
  AccountData.account.initDropdown("last-4-digits-dispute", g_acct_number, cc_number, null);
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/dispute.grxml", null, dispute_grammarHandler);
}

function dispute_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    if (interp == "continue") {
      $.mobile.changePage($("#survey"));
    } else if (interp == "back") {
      history.back();
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

function survey_init() {
  NativeBridge.setGrammar(gResourceRootUrl + "grammars/survey.grxml", null, survey_grammarHandler);
}

function survey_grammarHandler(result) {
  if (result != null && result.length > 0) {
    var interp = result[0].interpretation;
    if (interp == "one") {
      survey_updateStars(1, 5);
      //$("#rating-1").attr('checked', true).checkboxradio('refresh', true);
    } else if (interp == "two") {
      survey_updateStars(2, 5);
      //$("#rating-2").attr('checked', true).checkboxradio('refresh', true);
    } else if (interp == "three") {
      survey_updateStars(3, 5);
      //$("#rating-3").attr('checked', true).checkboxradio('refresh', true);
    } else if (interp == "four") {
      survey_updateStars(4, 5);
      //$("#rating-4").attr('checked', true).checkboxradio('refresh', true);
    } else if (interp == "five") {
      survey_updateStars(5, 5);
      //$("#rating-5").attr('checked', true).checkboxradio('refresh', true);
    } else if (interp == "back") {
      history.back();
    } else if (interp == "chat") {
      $.mobile.changePage($("#chat"));
    } else {
      alert("Bad input:" + interp + ".");
    }
  } else {
    alert("No input.");
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

function survey_updateStars(rating, max) {
  var i;
  for (i = 0; i <= rating; i++) {
    $("#star-" + i).attr("style", "background: url(img\/star.gif) no-repeat; background-position: 0 -64px;");
  }
  for (i = rating + 1; i <= max; i++) {
    $("#star-" + i).attr("style", "background: url(img\/star.gif) no-repeat;");
  }
}
