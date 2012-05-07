#!/usr/local/bin/perl

my $num_args = $#ARGV + 1;
if ($num_args != 8) {
  print "\nUsage: $0 <client_name> <card_name> \\ \n" .
    "    <last_num_card_digits> <last_card_digits_prefix> \\ \n" .
    "    <background_color> <background_repeat> <font_color> <heading_font_color>" .
    "\nExamples:\n" .
    "    $0 \"amex\" \"Personal Card\" \"5\" \"-\" \"\" \"\" \"#26759b\" \"#26759b\" \n" .
    "    $0 \"capone\" \"Personal Credit Card\" \"4\" \"...\" \"#013b70\" \"no-repeat\" \"#06467C\" \"#ffffff\" \n";
  exit;
}

my $client_name = $ARGV[0];
my $card_name = $ARGV[1];
my $last_num_card_digits = $ARGV[2];
my $last_card_digits_prefix = $ARGV[3];
my $background_color = $ARGV[4];
my $background_repeat = $ARGV[5];
my $font_color = $ARGV[6];
my $heading_font_color = $ARGV[7];

my %config = ( "CLIENT_NAME" => $client_name,
               "CARD_NAME" => $card_name,
               "LAST_NUM_CARD_DIGITS" => $last_num_card_digits,
               "LAST_CARD_DIGITS_PREFIX" => $last_card_digits_prefix,
               "BACKGROUND_COLOR" => $background_color,
               "BACKGROUND_REPEAT" => $background_repeat,
               "FONT_COLOR" => $font_color,
               "HEADING_FONT_COLOR" => $heading_font_color,
             );

_generate_client_file("index-template.html", "index-" . $client_name . ".html");
_generate_client_file("css/demo-template.css", "css/demo-" . $client_name . ".css");
_generate_client_file("js/acctdata-template.js", "js/acctdata-" . $client_name . ".js");

sub _generate_client_file {
    my ($template_path, $client_path) = @_;

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
