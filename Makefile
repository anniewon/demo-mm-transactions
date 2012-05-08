all: capone amex

clean: clean_capone clean_amex

capone:
	bin/generate_client_files.pl -make "capone" "Personal Credit Card" "4" "..." "#013b70" "no-repeat" "#06467C" "#ffffff"

clean_capone:
	bin/generate_client_files.pl -clean "capone"

amex:
	bin/generate_client_files.pl -make "amex" "Personal Card" "5" "-" "" "" "#26759b" "#26759b"

clean_amex:
	bin/generate_client_files.pl -clean "amex"
