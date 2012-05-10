#!/usr/local/bin/perl

my ($option, $client_name, $client_html_file, $client_css_file, $client_js_file);

my $num_args = $#ARGV + 1;

if ($num_args >= 2) {
    $option = $ARGV[0];
    $client_name = $ARGV[1];
    $client_html_file = "index-" . $client_name . ".html";
    $client_css_file = "css/demo-" . $client_name . ".css";
    $client_js_file = "js/acctdata-" . $client_name . ".js";
    $client_data_file1 = "data/acctdata/1-" . $client_name . ".json";
    $client_data_file2 = "data/acctdata/2-" . $client_name . ".json";

    if ($option eq "-make" && $num_args == 10) {
        my $card_name1 = $ARGV[2];
        my $card_name2 = $ARGV[3];
        my $last_num_card_digits = $ARGV[4];
        my $last_card_digits_prefix = $ARGV[5];
        my $background_color = $ARGV[6];
        my $background_repeat = $ARGV[7];
        my $font_color = $ARGV[8];
        my $heading_font_color = $ARGV[9];

        my %config = ( "CLIENT_NAME" => $client_name,
                       "CARD_NAME1" => $card_name1,
                       "CARD_NAME2" => $card_name2,
                       "LAST_NUM_CARD_DIGITS" => $last_num_card_digits,
                       "LAST_CARD_DIGITS_PREFIX" => $last_card_digits_prefix,
                       "BACKGROUND_COLOR" => $background_color,
                       "BACKGROUND_REPEAT" => $background_repeat,
                       "FONT_COLOR" => $font_color,
                       "HEADING_FONT_COLOR" => $heading_font_color,
                     );

        _generate_client_file("index-template.html", $client_html_file, %config);
        _generate_client_file("css/demo-template.css", $client_css_file, %config);
        _generate_client_file("js/acctdata-template.js", $client_js_file, %config);
        _generate_client_file("data/acctdata/1-template.json", $client_data_file1, %config);
        _generate_client_file("data/acctdata/2-template.json", $client_data_file2, %config);

    } elsif ($option eq "-clean" && $num_args == 2) {
        unlink($client_html_file);
        unlink($client_css_file);
        unlink($client_js_file);
        unlink($client_data_file1);
        unlink($client_data_file2);

    } else {
        _print_usage();
        exit;
    }
} else {
    _print_usage();
    exit;
}



sub _generate_client_file {
    my ($template_path, $client_path, %config) = @_;

    my ($template_fh, $client_fh);

    open($template_fh, "<", $template_path) ||
      print "Could not open template file for writing at '" .
        $template_path .  "', error: " . ($! || 'UNKNOWN ERROR');

    open($client_fh, ">", $client_path) ||
      print "Could not open client file for writing at '" .
        $client_path . "', error: " . ($! || 'UNKNOWN ERROR');

    while (my $line = <$template_fh>) {
        chomp $line;
        for my $key (keys %config) {
            $line =~ s/\$$key/$config{$key}/g;
        }
        print $client_fh $line, "\n";
    }

    close $template_fh; close $client_fh;

    return 1;
}

sub _print_usage {
    print "\nUsage: \n" .
        "1) $0 -make <client_name> <card_name1> <card_name2> \\ \n" .
        "    <last_num_card_digits> <last_card_digits_prefix> \\ \n" .
        "    <background_color> <background_repeat> <font_color> <heading_font_color> \n" .
        "2) $0 -clean <client_name> \n" .
        "\nExamples:\n" .
        "    $0 -make \"amex\" \"Personal Card\" \"Personal Card\" \"5\" \"-\" \"\" \"\" \"#26759b\" \"#26759b\" \n" .
        "    $0 -make \"capone\" \"Platinum Card\" \"Cash Rewards\" \"4\" \"...\" \"#013b70\" \"no-repeat\" \"#06467C\" \"#ffffff\" \n" .
        "    $0 -clean \"amex\" \n" .
        "    $0 -clean \"capone\" \n";
}
