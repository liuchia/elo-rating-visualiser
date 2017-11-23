# Takes in a CSV file of the format : [PLAYER1, "beat" or "tied", PLAYER2, DD/MM/YYYY date]
# Outputs in format : [date,team1,rating1,team2,rating2,team3,rating3,team4,rating4,team5,rating5,team6,rating6]

TEAMA, RESULT, TEAMB, DATE = 0, 1, 2, 3;
K = 32;
N = 6;

$exists = Hash.new(false);
$rating = Hash.new(1500);
$teams = Array.new;
date = nil;

$previous = "";

def Create(teamname)
	$exists[teamname] = true;
	$teams << teamname;
end

def Match(teama, teamb, sa)
	ra = 10**($rating[teama]/400.0);
	rb = 10**($rating[teamb]/400.0);
	ea = ra/(ra + rb);
	diff = K*(sa - ea);
	$rating[teama] += diff;
	$rating[teamb] -= diff;
end

def Print(date)
	$teams.sort! {|a, b| ($rating[a] <=> $rating[b])*-1}
	toprint = "%s,%s" % [date, $teams[0...N].map{|i| [i, $rating[i].floor].join(",")}.join(",")];
	puts toprint if toprint[11...toprint.length] != $previous[11...toprint.length];
	$previous = toprint;
end

puts "date,%s" % (1..N).to_a.map{|i| "team%d,rating%d" % [i, i]}.join(",");
STDIN.each_line do |line|
	entries = line.chomp.split(",");
	teama = entries[TEAMA];
	teamb = entries[TEAMB];
	Create(teama) if not $exists[teama];
	Create(teamb) if not $exists[teamb];
	if entries[RESULT] == "beat" then
		Match(teama, teamb, 1);
	elsif entries[RESULT] == "draw" then
		Match(teama, teamb, 0.5);
	end

	if date != entries[DATE] and date != nil then
		Print(entries[DATE]);
	end
	date = entries[DATE];
end