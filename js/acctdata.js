var AccountData = AccountData || {};
var g_acct_number = 1;

// Use this BaseUrl attribute to change the global location of the data
AccountData.BaseUrl = location.protocol + '//' + location.hostname + '/content/transdemo/data/acctdata';

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

    var makeAccountUrl = function(acct_number) {
        return AccountData.BaseUrl + '/' + acct_number + '.json';
    };

    var listCards = function(div, data, selected_cc_number) {
        var img = '<img src="http://www.creditcards.com/images/Bank-Logos-Mastercard.gif" />';
        var div = $('#' + div);
        div.empty();
        $(img).appendTo(div);
        var sel = $('<select name="card-choice" id="card-choice" data-mini="true"' + 
            (selected_cc_number? 'disabled' : '') + '></select>').appendTo(div);
        for (var i = 0; i < data.dest_accounts.length; i += 1) {
            var cc_num = data.dest_accounts[i].number;
            var last_4 = cc_num.substr(-4);
            $('<option value="' + cc_num + '"' + (cc_num == selected_cc_number? 'selected' : '') + 
                '>...' + last_4 + '</option>').appendTo(sel)
        }
        sel.selectmenu();
    };

    // API bits
    return {
        initDropdown: function(div, acct_number, selected_cc_number, callback) {
            var url = makeAccountUrl(acct_number);
            $.getJSON(url, function(results) {
                data = results;
                listCards(div, data, selected_cc_number);
                if (typeof callback === 'function') {
                    callback($('#card-choice'), data);
                }
            });
        },
        getData: function() {
            return data;
        }
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

    // Return the URL for fetching the CC transaction information
    var makeCCNumberUrl = function(cc_number) {
        return AccountData.BaseUrl + '/transactions-' + cc_number + '.json';
    };

    // Return the HREF for displaying transaction details
    var transactionShowHref = function(cc_number, transaction) {
        return '#transaction-detail?cc_number=' + cc_number + 
               '&transaction_id=' + transaction.id;
    };

    // Return the HTML for the Date portion of the list item
    var transactionCal = function(transaction) {
        return '<div class="list-cal">' +
               '<div class="cal-top">' + transaction.dow +
               ', ' + transaction.month + '</div>' +
               '<div class="cal-bot">' + transaction.day + '</div>' +
               '</div>';
    };

    // Return a short description in 2 divs for the charge list
    var transactionShort = function(transaction) {
        return transactionCal(transaction) +
            '<div class="list-partial">' + 
            '<div class="part-name">' + transaction.name + '</div>' +
            '<div class="part-addr">' + transaction.city + ', ' +
            transaction.state + '</div></div>' +
            '<div class="list-amount">' + transaction.amount + '</div>';
    };

    // Display the list of transactions in the charges-list
    var displayTransactions = function(cc_number, data) {
        if (data.transactions.length > 0) {
            var list = $("#charges-list");
            list.empty();
            var items = [];
            for (var i = 0; i < data.transactions.length; i += 1) {
                var transaction = data.transactions[i];
                var href = transactionShowHref(cc_number, transaction);
                var show = transactionShort(transaction);
                items.push('<li><a data-url="' + href + '" href="' + href + '">' + show + '</a></li>');
            }
            $(items.join('')).appendTo(list);
            list.listview('refresh');
        }
    };

    // Display a specific transaction in the charge-detail 
    var displayTransactionHelper = function(transaction) {
        if (transaction != null) {
            var city = transaction.city + ", " + 
                transaction.state + " " + transaction.zipcode;
            var mlocation = transaction.address + ", " + city;        
            $("#amount").html(transaction.amount);
            $("#datetime").html(transaction.dow + ", " + transaction.month + 
                " " + transaction.day + ", " + transaction.year + " " + 
                transaction.time + " " + transaction.zone);
            $("#merchant").html(transaction.name);
            $("#mlocation").html(transaction.address + "<br>" + city);
            $("#map").attr("src", "https://maps.googleapis.com/maps/api/staticmap?center=" + 
                encodeURIComponent(mlocation) +  "&zoom=14&size=288x200&markers=" + 
                encodeURIComponent(mlocation) + "&sensor=false");
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
        return data;
    };

    return {
        display: function(cc_number, callback) {
            var url = makeCCNumberUrl(cc_number);
            $.getJSON(url, function(results) {
                data = results;
                displayTransactions(cc_number, data);
                if (typeof callback === 'function') {
                    callback(data);
                }
            });
        },
        displayTransaction: function(cc_number, transaction_id, callback) {
            var url = makeCCNumberUrl(cc_number);
            $.getJSON(url, function(results) {
                for (var i = 0; results.transactions.length > 0 && i < results.transactions.length; i += 1) {
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
        getData: getData
     };
})(jQuery);
