# formatted some input data from http://www.football-data.co.uk/englandm.php
require "date";

FIRST_YEAR = 1993;
LAST_YEAR = 2016;

DATE, HOME, AWAY, RESULT = 1, 2, 3, 6;

(FIRST_YEAR..LAST_YEAR).each do |year|
	filename = __dir__ + "/Original/%d-%d.csv" % [year, year+1];
	File.open(filename) do |file|
		file.each do |line|
			entries = line.scrub.split(",");
			entries[DATE] = Date.strptime(entries[DATE], "%d/%m/%y").strftime("%d/%m/%Y") if entries[DATE].length == 8;
			if entries.first == "E0" then
				if entries[RESULT] == "H" then
					puts "%s,%s,%s,%s" % [entries[HOME], "beat", entries[AWAY], entries[DATE]];
				elsif entries[RESULT] == "A" then
					puts "%s,%s,%s,%s" % [entries[AWAY], "beat", entries[HOME], entries[DATE]];
				elsif entries[RESULT] == "D" then
					puts "%s,%s,%s,%s" % [entries[HOME], "tied", entries[AWAY], entries[DATE]];
				end
			end
		end
	end
end