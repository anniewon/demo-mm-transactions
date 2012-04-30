var AccountData = AccountData || {};

// Use this BaseUrl attribute to change the global location of the data
AccountData.BaseUrl = 'data/acctdata';

/*
 * Account Data Loader
 *
 * Loads mock account information.
 *
 *   AccountData.account.initDropdown(account_number);
 *   var account_data = AccountData.account.getData();
 *
 * account_data.fullname      => string
 * account_data.org           => string
 * account_data.emailaddrs    => array of hash {type, value, pref}
 * account_data.telephones    => array of hash {type, value, pref}
 * account_data.addresses     => array of hash {type, value, format}
 * account_data.urls          => array of hash {type, value}
 * account_data.src_accounts  => array of hash {name, routing, number}
 * account_data.dest_accounts => array of hash {name, number, balance, duedate}
 *
 */
AccountData.account = (function($) {
    var data = null;
    var _active_acct_number = null;
    var _active_cc_number = null;

    var mc_img = '<img src="img/mastercard.png" height="28px" style="padding-top: 2px;"/>';


    var makeAccountUrl = function() {
        return AccountData.BaseUrl + '/' + _active_acct_number + '.json';
    };


    var select_element = function(selected, disabled) {
        var opt = disabled ? ' disabled="disabled"' : '';
        return $('<select name="card-choice" id="card-choice"' +
                 ' data-mini="true"' + opt + '></select>');
    };


    var select_option = function(cc_number, selected) {
        var last_4 = cc_number.substr(-4);
        var extra  = $.inArray(cc_number, [selected, _active_cc_number]) < 0 ?
                     '' : ' selected="selected"';
        var option = '<option value="' + cc_number + '"' + extra +
                     '>...' + last_4 + '</option>';
        return $(option);
    };


    var listCards = function(div, disabled) {
        var div = $('#' + div);
        div.empty();

        var selected_cc_number = AccountData.account.active_cc_number();

        // Add the CC icon
        $(mc_img).appendTo(div);

        // Build the CC dropdown list
        var dropdown = select_element(selected_cc_number, disabled).appendTo(div);
        $(data.dest_accounts).each( function(i, acct) {
            select_option(acct.number, selected_cc_number).appendTo(dropdown);
        });
        dropdown.selectmenu();

        // Setup the default change handler to record active CC number
        dropdown.on('change', function() {
            _active_cc_number = dropdown[0].value;
            populate_payment_due();
        });
        // Call the change handler to update the active CC number
        dropdown.change();

        return dropdown;
    };

    var dest_account = function() {
        return $.grep(data.dest_accounts, function(acct) {
            return acct.number === _active_cc_number;
        })[0];
    };

    var populate_payment_due = function() {
        var acct = dest_account();
        var date = AccountData.utils.date_due(acct.datedue);
        $('#minimum-payment-value').html('$' + acct.balance);
        var duedate = $('#payment-due-value').html(date);
        return acct;
    };

    // API bits
    return {
        init: function(acct_number) {
            _active_acct_number = acct_number;
        },
        initDropdown: function(div, disabled, callback) {
            var url = makeAccountUrl();
            if (data === null) {
                $.getJSON(url, function(results) {
                    data = results;
                    var dropdown = listCards(div, disabled);
                    if (typeof callback === 'function') {
                        callback(dropdown, data);
                    }
                });
            } else {
                var dropdown = listCards(div, disabled);
                if (typeof callback === 'function') {
                    callback(dropdown, data);
                }
            }
        },
        getData: function() {
            return data;
        },
        active_acct_number: function() {
            return _active_acct_number;
        },
        active_cc_number: function() {
            return _active_cc_number;
        },
        populate_payment_due: populate_payment_due
    };
})(jQuery);


/*
 * Account Transaction Loader
 *
 * Loads mock transaction data for a given CC number.
 *
 *   AccountData.transactions.display(cc_number);
 *   var data = AccountData.transactions.getData();
 *   for (var i = 0; i < data.transactions.length; i += 1) {
 *       ...
 *   }
 *
 * transactionData.transactions => array of hash {
 *   id,
 *   name, address, city, state, zipcode,
 *   amount,
 *   dow, day, month, year, time, zone
 * }
 */
AccountData.transactions = (function($) {
    var data = null;
    var active_cc_number = null;

    // Return the URL for fetching the CC transaction information
    var makeCCNumberUrl = function() {
        return AccountData.BaseUrl + '/transactions-' +
               active_cc_number + '.json';
    };

    // Return the HREF for displaying transaction details
    var transactionShowHref = function(idx, transaction) {
        var page = transaction.is_payment() ? '#payment-detail'
                                            : '#transaction-detail';
        return page + '?index=' + idx +
               '&cc_number=' + AccountData.account.active_cc_number() + 
               '&transaction_id=' + transaction.id;
    };

    // Return the HTML for the Date portion of the list item
    var transactionCal = function(transaction) {
        return '<div class="list-cal">' +
               '<div class="cal-top">' + transaction.dow_month() + '</div>' +
               '<div class="cal-bot">' + transaction.day + '</div>' +
               '</div>';
    };

    // Return a short description in 2 divs for the charge list
    var transactionShort = function(transaction) {
        var div = transactionCal(transaction) + '<div class="list-partial">';
        if (transaction.is_payment()) { 
            div += '<div class="part-payment">' + transaction.name + '</div>';
        } else {
            div += '<div class="part-name">' + transaction.name + '</div>';
            div += '<div class="part-addr">' + transaction.location_short() +
                   '</div>';
        }
        div += '</div>';
        div += '<div class="list-amount">' + transaction.amount + '</div>';
        return div;
    };

    // Display the list of transactions in the charges-list
    var displayTransactions = function(data) {
        var page = location.hash.replace(/\?.*/, '');
        if (page === '#recent-transactions') {
            var list = $("#charges-list");
            list.empty();
            var items = [];
            for (var i = 0; i < data.transactions.length; i += 1) {
                var transaction = data.transactions[i];
                var show = transactionShort(transaction);
                var href = transactionShowHref(i, transaction);
                items.push('<li><a data-url="' + href + '" href="' + href + '">' + show + '</a></li>');
            }
            $(items.join('')).appendTo(list);
            if (data.transactions.length > 0) {
                list.listview('refresh');
            }
        }
    };

    // Display a specific transaction in the charge-detail 
    var displayTransactionHelper = function(transaction) {
        if (transaction != null) {
            var city = transaction.location();
            if (transaction.is_payment()) {
                $('#payment-amount').html(transaction.payment());
                $('#payment-datetime').html(transaction.full_date());
            } else {
                $('#amount').html(transaction.amount);
                $('#datetime').html(transaction.full_date());
                $('#merchant').html(transaction.merchant);
                if (transaction.address.length > 0) {
                    $('#mlocation').html(transaction.address + '<br/>' + city);
                } else {
                    $('#mlocation').html(city);
                }
                if (city == "") {
                  $('#map').attr('src', "");
                } else {
                  $('#map').attr('src',
                      'https://maps.googleapis.com/maps/api/staticmap?center=' + 
                      encodeURIComponent(transaction.full_address()) +
                      '&zoom=14&size=288x200&markers=' + 
                      encodeURIComponent(transaction.full_address()) +
                      '&sensor=false');
                }
            }
/*
            $('#map-canvas').gmap({
                zoom: 15,
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
                draggable: false
            });
            $('#map-canvas').gmap('clear', 'markers');
            $('#map-canvas').gmap('search', { 'address': mlocation }, function(results) {
                var latlng = new google.maps.LatLng(results[0].geometry.location.lat(), 
                                                    results[0].geometry.location.lng());
                $('#map-canvas').gmap('option', 'center', latlng);;
                $('#map-canvas').gmap('addMarker', { 'position': latlng, 'bounds': false });
                $('#map-canvas').gmap('refresh');
            });
*/
        }
    };

    var getData = function() {
        if (active_cc_number) {
            return data[active_cc_number];
        }
        return { transactions: [] };
    };

    var show_transactions = function(data, callback) {
        var page = location.hash.replace(/\?.*/, '');
        if (page === '#recent-transactions') {
            displayTransactions(data);
        }
        if (typeof callback === 'function') {
            callback(data);
        }
    };

    var load_cc_data = function(cc_number, callback) {
        var url = makeCCNumberUrl(cc_number);
        $.getJSON(url, function(results) {
            var list = results.transactions;
            data[cc_number] = {};
            data[cc_number].transactions = list.map(function(obj) {
              return new Transaction(obj);
            });
            show_transactions(data[cc_number], callback);
        });
    };

    return {
        display: function(cc_number, callback) {
            active_cc_number = cc_number
            data = data || {};
            if (data[active_cc_number] === undefined) {
                load_cc_data(cc_number, callback);
            } else {
                show_transactions(data[cc_number], callback);
            }
        },
        displayTransactions: displayTransactions,
        displayTransactionHelper: displayTransactionHelper,
/*
        displayTransaction: function(cc_number, transaction_id, callback) {
            var url = makeCCNumberUrl(cc_number);
            $.getJSON(url, function(results) {
                for (var i = 0; i < results.transactions.length; i += 1) {
                    var transaction = results.transactions[i];
                    if (transaction_id == transaction.id) {
                        displayTransactionHelper(transaction);
                        if (typeof callback === 'function') {
                            callback(transaction);
                        }
                        break;
                    }
                }
            });
        },
*/
        getData: getData,
        getMerchants: function() {
            return $.unique(getData().transactions.map(function(transaction) {
                return AccountData.utils.merchant_decode(transaction.merchant);
            }).sort()).sort();
        }
     };
})(jQuery);


// ----------------------------------------------------------------------------
// Module: AccountData.utils
//
// AccountData.utils.timestamp_to_object(millis)
// AccountData.utils.transaction_date(transaction)
// AccountData.utils.transaction_date_object(transaction)
//
AccountData.utils = (function($) {
  var dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Return printable 2 digit time value for hours, minutes and seconds
  var two_digit_string = function(num) {
    return (num < 10) ? '0' + num : '' + num;
  };

  // Convert milliseconds into displayable date attributes
  //
  //  var millis = $.now();
  //  var dt_obj = AccountData.utils.timestamp_to_object(millis);
  //
  // @param timestamp - integer, time in millis
  // @return object - day, dow, month, year attributes
  //
  var timestamp_to_object = function(timestamp) {
    var date = new Date(timestamp);
    var hour = two_digit_string(date.getHours());
    var mins = two_digit_string(date.getMinutes());
    var secs = two_digit_string(date.getSeconds());
    var time = [hour, mins, secs].join(':');
    return {
      day:     date.getDate(),
      dow:     dows[date.getDay()],
      month:   mons[date.getMonth()],
      year:    date.getYear() + 1900,
      hhmmss:  time,
      hours:   hour,
      minutes: mins,
      seconds: secs
    };
  };

  // Convert 'daysago' or [dow, month, day, year, time, zone] into a
  // timestamp (in milliseconds). Returns -1 if timestamp cannot be
  // created.  Updates transaction object with 'timestamp' attribute.
  //
  // @param transaction - a transaction object from JSON
  // @return timestamp in milliseconds
  //
  var transaction_date = function(transaction) {
    var day_millis = 24 * 60 * 60 * 1000;
    if (transaction['timestamp'] !== undefined) {
      return transaction.timestamp;
    }
    if (transaction['daysago'] !== undefined) {
      var now = new Date();
      var hrs = transaction.time.match(/\d+/g).map(function(a) {return a - 0});
      now.setHours(hrs[0], hrs[1]);
      var xtm = new Date(now.getTime() - transaction.daysago * day_millis);
      transaction.timestamp = xtm.getTime();
      return transaction.timestamp;
    }
    if (transaction['dow'] !== undefined) {
      transaction.timestamp = Date.parse(
        transaction.dow + ' ' +
        transaction.month + ' ' +
        transaction.day + ' ' +
        transaction.year + ' ' +
        transaction.time + ' ' +
        transaction.zone);
      return transaction.timestamp;
    }
    return -1; // Error in transaction object
  };

  var merchant_decode = function(value) {
    return $('<div/>').html(value).text();
  }

  // Return a date object for the given transaction
  //
  // @param transaction - a transaction object from JSON
  // @return object - day, dow, month, year attributes
  //
  var transaction_date_object = function(transaction) {
    return timestamp_to_object(transaction_date(transaction));
  };

  var date_due = function(datedue) {
      var tstamp = 0;
      if (datedue.match(/^-?\d+$/)) {
          tstamp = $.now() + (parseFloat(datedue) * 24 * 60 * 60 * 1000) * -1;
      } else {
          tstamp = Date.parse(datedue);
      }
      var obj = timestamp_to_object(tstamp);
      return obj.month + ' ' + obj.day + ', ' + obj.year;
  };

  return {
    timestamp_to_object: timestamp_to_object,
    transaction_date: transaction_date,
    transaction_date_object: transaction_date_object,
    merchant_decode: merchant_decode,
    date_due: date_due
  };
})(jQuery);
