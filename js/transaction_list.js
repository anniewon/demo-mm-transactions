// MODEL: Transaction
//
// Encapsulates Date display formats
// Encapsulates Location display formats
var Transaction = function(obj) {
  $.extend(this, obj);
  var date_obj = AccountData.utils.transaction_date_object(this);
  $.extend(this, date_obj);
  this.merchant = obj.name;
};

// Return "City, ST"
Transaction.prototype.location_short = function() {
  if (this['_location_short'] === undefined) {
    var parts = [];
    if (this.city.length > 0) {
      parts.push(this.city);
    }
    if (this.state.length > 0) {
      parts.push(this.state);
    }
    this._location_short = parts.join(', ');
  }
  return this._location_short;
};

// Return "City, ST Zipcode"
Transaction.prototype.location = function() {
  if (this['_location_full'] === undefined) {
    var parts = [];
    var short = this.location_short();
    if (short.length > 0) {
      parts.push(short);
    }
    if (this.zipcode.length > 0) {
      parts.push(this.zipcode);
    }
    this._location_full = parts.join(' ');
  }
  return this._location_full;
};

// Return "Address, City, ST Zipcode"
Transaction.prototype.full_address = function() {
  if (this['_full_addr'] === undefined) {
    this._full_addr = this.address + ', ' + this.location();
  }
  return this._full_addr;
};

Transaction.prototype.dow_month = function() {
  if (this['_dow_mon'] === undefined) {
    this._dow_mon = this.dow   + ', ' + this.month;
  }
  return this._dow_mon;
};

Transaction.prototype.full_date = function() {
  if (this['_full_date'] === undefined) {
    this._full_date = this.dow_month() + ' ' +
      this.day   + ', ' +
      this.year  + ' ' +
      this.time  + ' ' +
      this.zone;
  }
  return this._full_date;
};

Transaction.prototype.is_payment = function() {
  if (this['_is_payment'] === undefined) {
    this._is_payment = this.name.match(/^payment$/i) !== null;
  }
  return this._is_payment;
};

Transaction.prototype.payment = function() {
  if (this.is_payment()) {
    return this.amount.replace('-', '');
  }
  return this.amount;
};


// MODULE: TransactionList
var TransactionList = (function($) {
  var cc_num  = null;
  var data    = null;
  var cur_idx = 0;
  var filters = {
    'date':     [],
    'merchant': [],
    'amount':   [],
    'sort':     []
  };


  var init = function(callback) {
    console.log('TransactionList.init()');
    data    = null;
    cc_num  = AccountData.account.active_cc_number();
    AccountData.transactions.display(cc_num, function(data) {
      if (typeof callback === 'function') {
        callback(data);
      }
      apply_filters();
    });
  };


  var getData = function() {
    if (data === null || data === undefined) {
      var list = AccountData.transactions.getData().transactions;
      data = { transactions: list.map(function(obj) { return obj; }) };
      apply_filters();
    }
    return data;
  };


  var length = function() {
    return getData().transactions.length;
  }

  var amount_to_float = function(value) {
    return parseFloat( value.match(/\d+(\.\d+)?$/)[0] );
  };


  // Conver HTML into text and return a list of possible values
  var merchant_decode = function(value) {
    var text = $('<div/>').html(value).text().toLowerCase();
    var list = [text];
    if (text.match(/ & /)) {
      list.push( text.replace(/ & /g, ' and ') );
    }
    return list;
  }

  var date_value_to_timestamp = function(value) {
    if (typeof value === 'number') {
      return value;
    }
    // Wed Jan 15 2012
    if (value.match(/^(:?[SMTWF]\w\w\w? )?[JFMASOND][a-z]{2} \d\d? \d{4}$/)) {
      return Date.parse(value);
    }
    // Wed Jan 15
    if (value.match(/^(:?[SMTWF]\w\w\w? )?[JFMASOND][a-z]{2} \d\d?$/)) {
      var val = value + ' ' + ((new Date()).getYear() + 1900);
      return Date.parse(val);
    }
    // Millis as string
    if (value.match(/^\d+$/)) {
      return parseFloat(value);
    }
    return -1;
  };


  var _filter_by_date = function(value, direction) {
    var list = [];
    value = date_value_to_timestamp(value);
    switch (direction) {
      case 'since':
      case 'after':
        list = $.grep(getData().transactions, function(transaction) {
          return transaction_date(transaction) >= value;
        });
        break;
      case 'prior to':
      case 'before':
        list = $.grep(getData().transactions, function(transaction) {
          return transaction_date(transaction) < value;
        });
        break;
      case 'on':
      default:
        var days_end = value + 24 * 60 * 60 * 1000;
        list = $.grep(getData().transactions, function(transaction) {
          var trans_date = transaction_date(transaction);
          return (trans_date >= value) && (trans_date < days_end);
        });
        break;
    }
    getData().transactions = list;
  };


  var refresh_list = function() {
    AccountData.transactions.displayTransactions(getData());
    return length();
  };


  var capitalize = function(str) {
    return str[0].toUpperCase() + str.substr(1);
  };

  var date_filter_label = function(value, direction) {
    var str = '';
    if (typeof value === 'number') {
      var date = AccountData.utils.timestamp_to_object(value);
      str = date.month + ' ' + date.day;
    } else {
      str = value.match(/[JFMASOND][a-z]{2} \d+/)[0];
    }
    if (direction !== undefined && direction.length > 0) {
      return capitalize(direction) + ' ' + str;
    }
    return str;
  };

  // Filter by date
  //
  // @param value      a date value in milliseconds
  // @param direction  'after' or 'before'
  //
  var filter_by_date = function(value, direction) {
    filters['date'] = [value, direction];
    add_filter_cancel_button('date', date_filter_label(value, direction));
    _filter_by_date(value, direction);
    return refresh_list();
  };


  var _filter_by_amount = function(value, direction) {
    var list = [];
    switch (direction) {
      case 'over':
      case 'greater than':
        list = $.grep(getData().transactions, function(transaction) {
          return amount_to_float(transaction.amount) > value;
        });
        break;
      case 'less than':
        list = $.grep(getData().transactions, function(transaction) {
          return amount_to_float(transaction.amount) < value;
        });
        break;
      case 'about':
      case 'around':
        var upper_limit = value + 50;
        var lower_limit = value - 50;
        list = $.grep(getData().transactions, function(transaction) {
          var amount = amount_to_float(transaction.amount);
          return amount > lower_limit && amount < upper_limit;
        });
        break;
      case 'exactly':
      default:
        list = $.grep(getData().transactions, function(transaction) {
          return amount_to_float(transaction.amount) == value;
        });
        break;
    }
    getData().transactions = list;
  };


  // Filter by amount
  //
  // @param value      a numeric value
  // @param direction  'greater than' or 'less than'
  //
  var filter_by_amount = function(value, direction) {
    filters['amount'] = [value, direction];
    var label = [capitalize(direction), value].join(' ');
    add_filter_cancel_button('amount', label);
    _filter_by_amount(value, direction);
    return refresh_list();
  };


  var _filter_by_merchant = function(value) {
    var what = value.toLowerCase();
    var list = $.grep(getData().transactions, function(transaction) {
      var candidates = merchant_decode(transaction.name);
      return $.inArray(what, candidates) >= 0;
    });
    getData().transactions = list;
  };


  // Filter by merchant name
  //
  // @param value   a string value
  //
  var filter_by_merchant = function(value) {
    filters['merchant'] = [value];
    add_filter_cancel_button('merchant', value);
    _filter_by_merchant(value);
    return refresh_list();
  };


  var transaction_date = function(transaction) {
    return AccountData.utils.transaction_date(transaction);
  };

  // sorting functions
  var amount_sort_up = function(a, b) {
    return amount_to_float(a.amount) > amount_to_float(b.amount);
  };

  var amount_sort_down = function(a, b) {
    return amount_to_float(a.amount) < amount_to_float(b.amount);
  };

  var merchant_sort_up = function(a, b) {
    return a.name > b.name
  };

  var merchant_sort_down = function(a, b) {
    return a.name < b.name
  };

  var date_sort_up = function(a, b) {
    return transaction_date(a) > transaction_date(b);
  };

  var date_sort_down = function(a, b) {
    return transaction_date(a) < transaction_date(b);
  };


  var _sort = function(column, direction) {
    var callback;
    var desc = direction === 'desc';
    switch (column) {
      case 'amount':
        callback = desc ? amount_sort_down : amount_sort_up;
        break;
      case 'date':
        callback = desc ? date_sort_down : date_sort_up;
        break;
      case 'merchant':
        callback = desc ?  merchant_sort_down : merchant_sort_up;
        break;
    }
    getData().transactions.sort(callback);
  };


  // Sort a column
  var sort = function(column, direction) {
    filters['sort'] = [column, direction];
    add_filter_cancel_button('sort', 'Sort ' + column);
    _sort(column, direction);
    return refresh_list();
  };


  var clear_filters = function() {
    console.log('clear_filters()');
    filters = {
      'date':     [],
      'merchant': [],
      'amount':   [],
      'sort':     []
    }
    $(['date', 'merchant', 'amount', 'sort']).each(function(type) {
      $('#search-term-' + type).remove();
    });
    $('#search-terms').slideUp();
    data = null;
    getData();
  };


  var reset = function() {
    clear_filters();
    return refresh_list();
  };


  var apply_filters = function() {
    if (filters['date'].length > 0) {
      _filter_by_date( filters['date'][0], filters['date'][1] );
    }
    if (filters['merchant'].length > 0) {
      _filter_by_merchant(filters['merchant'][0]);
    }
    if (filters['amount'].length > 0) {
      _filter_by_amount(filters['amount'][0], filters['amount'][1]);
    }
    if (filters['sort'].length > 0) {
      _sort(filters['sort'][0], filters['sort'][1]);
    }
    return refresh_list();
  };

  var remove_filter = function(type) {
    filters[type] = [];
    data = null;
    getData();
    return apply_filters();
  };


  // <div><span>Vons</span><span class="cancel">&nbsp;</span></div>
  var add_filter_cancel_button = function(type, title) {
    var container = $('#search-terms');
    var id = 'search-term-' + type;
    var id_selector = '#' + id;
    if (container) {
      if ($(id_selector)) {
        $(id_selector).click();
        $(id_selector).remove();
      }
      container.slideDown();

      // Button container
      var button = $('<div/>').appendTo(container);
      button.attr('id', id);

      // Label for the button
      var label  = $('<span/>').appendTo(button);
      label.html(title);

      // Cancel icon
      var cancel = $('<span class="cancel">&nbsp;</span>').appendTo(button);

      // Add an onClick handler to remove this button an the filter
      button.on('click',  function() {
        $(id_selector).remove();
        if ($('#search-terms').children().length == 0) {
          container.slideUp();
        }
        remove_filter(type);
      });
      return true;
    }
    return false;
  };


  var get = function(idx) {
      idx = parseFloat(idx);
      getData();
      if (idx < 0) { idx = 0; }
      if (idx >= data.transactions.length) {
        idx = data.transactions.length - 1;
      }
      cur_idx = idx;
      return data.transactions[idx];
  };

  var prev = function() {
    if (cur_idx > 0) {
      cur_idx = cur_idx - 1;
    }
    return getData().transactions[cur_idx];
  };

  var next = function() {
    if (cur_idx < getData().transactions.length - 1) {
      cur_idx = cur_idx + 1;
    }
    return getData().transactions[cur_idx];
  };

  // Display the details of the given transaction
  var update_transaction_details = function(transaction) {
    if (transaction.is_payment()) {
        $.mobile.changePage('#payment-detail', { changeHash: false } );
    } else {
        $.mobile.changePage('#transaction-detail', { changeHash: false } );
    }
    AccountData.transactions.displayTransactionHelper(transaction);
  };


  return {
    init: init,
    filter_by_date: filter_by_date,
    filter_by_amount: filter_by_amount,
    filter_by_merchant: filter_by_merchant,
    sort: sort,
    reset: reset,
    clear_filters: clear_filters,
    filters: function() { return filters; },

    // Uncomment for debugging
    //remove_filter: remove_filter,
    //add_filter_cancel_button: add_filter_cancel_button,
    getData: getData,
    //cur_idx: function() { return cur_idx },
    //date_value_to_timestamp: date_value_to_timestamp,


    first: function() {
      return getData().transactions[0];
    },

    get:  get,
    prev: prev,
    next: next,

    last: function() {
      return getData().transactions[data.transactions.length - 1];
    },

    show_transaction: function(idx) {
      update_transaction_details(get(idx));
    },

    show_next_transaction: function() {
      update_transaction_details(next());
    },

    show_prev_transaction: function() {
      update_transaction_details(prev());
    },

    // Given a vendor name, return the index for the first transaction
    // record.
    //
    // @param name  a vendor name
    // @return idx  the index of the transaction or -1 if not found
    find_first: function(name) {
      getData();
      var trans_idx = -1;
      for (var i = 0; i < data.transactions.length; i += 1) {
        if (data.transactions[i].name.toLowerCase() === name.toLowerCase()) {
            trans_idx = i;
            break;
        }
      }
      return trans_idx;
    }
  };
})(jQuery);
