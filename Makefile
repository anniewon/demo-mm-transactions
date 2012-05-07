all: capone amex

capone:
	bin/generate_client_files.pl "capone" "Personal Credit Card" "4" "..." "#013b70" "no-repeat" "#06467C" "#ffffff"

amex:
	bin/generate_client_files.pl "amex" "Personal Card" "5" "-" "" "" "#26759b" "#26759b"