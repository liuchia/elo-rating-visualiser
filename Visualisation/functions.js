function ddmmyyToDate(a) {
	var parts = a.split("/");
	return new Date(parts[2], parts[1]-1, parts[0]);
}

function dateDifference(a, b) {
	var dt = Math.abs(b.getTime() - a.getTime());
	return Math.ceil(dt/(1000*3600*24));
}

function addHours(date, hours) {
    return new Date(date.getTime() + hours*60*60000);
}

function formatDate(date) {
	var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return month[date.getMonth()] + " " + date.getFullYear();
}

function linesGenerator() {
	var closed = [],
		open = {},
		prev = {},
		curr = {};

	function insert(teamname, date, rating) {
		if (!prev[teamname]) {
			open[teamname] = [];
		}
		open[teamname].push({date: date, rating: rating});
		curr[teamname] = true;
	}

	function progress(nextdate) {
		// iterate through prev. if not in curr then add to closed
		for (var key in prev) {
			if (!curr[key]) {
				var lastrating = open[key][open[key].length-1].rating;
				open[key].push({date: nextdate, rating: lastrating});
				closed.push({team: key, data: open[key]});
			}
		}
		prev = curr;
		curr = {};
	}

	function lines() {
		return closed;
	}

	return {
		insert: insert,
		progress: progress,
		lines: lines
	}
}

function drawBackground() {
	svg.append("rect")
		.attr("fill", "#161616")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", WIDTH)
		.attr("height", HEIGHT);
}

function setVariables(data) {
	firstDay = data[0].date;
	lastDay = data[data.length-1].date;
	endDay = addHours(lastDay, -SCREENHOURS);
	margin = {top: 20, right: 0, left: 0, bottom: 20}
	width = WIDTH - margin.left - margin.right
	height = HEIGHT - margin.top - margin.bottom;
}

function formatData(data) {
	data.forEach(function(line) {
		line.date = ddmmyyToDate(line.date);
		for (var i = 1; i <= N; i++) {
			line["rating"+i] = +line["rating"+i];
		}
	});	
}

function createContainers() {
	mainContainer = svg.append("g")
	clipPath = svg.append("clipPath")
			.attr("id", "PathClipper")
		.append("rect")
			.attr("x", margin.left)
			.attr("y", margin.top)
			.attr("width", width*0.8)
			.attr("height", height);
	plotArea = svg.append("g")
		.attr("transform", "translate("+margin.left+","+margin.top+")")
		.attr("clip-path", "url(#PathClipper)");
}

function createCircles() {
	var circleArea = svg.append("g")
		.attr("class", "circles")
		.attr("transform", "translate("+margin.left+","+margin.top+")");

	for (var i = 0; i < N; i++) {
		circleArea.append("circle")
			.attr("id", "circle"+i)
			.attr("r", 3)
			.attr("cx", 50)
			.attr("cy", 50)
			.attr("stroke-width", 3);
	}
}


function createTexts() {
	svg.append("text")
		.attr("id", "CurrentDate")
		.attr("font-size", "14px")
		.attr("font-family", "sans-serif")
		.attr("x", WIDTH/2)
		.attr("y", HEIGHT-margin.bottom/2)
		.attr("fill", "#ADADDA")
		.attr("text-anchor", "middle")
		.text("")

	for (var i = 0; i < N; i++) {
		svg.select(".circles").append("text")
			.attr("id", "team"+i)
			.attr("x", width*0.8 + 15)
			.attr("y", i*20 + 50)
			.attr("fill", "#ADADDA")
			.attr("font-size", "14px")
			.attr("font-family", "sans-serif")
			.text("")
	}
}

function createPaths(data) {
	var lineGen = linesGenerator();
	for (var ii = 0; ii < data.length; ii++) {
		var line = data[ii];
		for (var i = 1; i <= N; i++) {
			lineGen.insert(line["team"+i], line.date, line["rating"+i]);
		}
		lineGen.progress(data[ii].date);
	}
	lineGen.progress(lastDay);

	var paths = lineGen.lines();
	for (var i = 0; i < paths.length; i++) {
		plotArea.append("path")
			.datum(paths[i].data)
			.attr("class", paths[i].team.replace(/\s|'/g, "") + " datapath")
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1)
			.attr("d", d3.line()
				.curve(d3.curveStepAfter)
				.x(function(d) { return xScale(d.date) })
				.y(function(d) { return yScale(d.rating) })
			)
	}
}

function createScales() {
	xScale = d3.scaleTime()
		.domain([firstDay, addHours(firstDay, SCREENHOURS)])
		.range([0, width]);
	yScale = d3.scaleLinear()
		.domain([1500, 2000])
		.range([height, 0]);
	/*mainContainer.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate("+margin.left+","+height+")")
		.call(d3.axisBottom(xScale));*/
}

function updatePaths(elapsed) {
	var leftDomain = addHours(firstDay, elapsed*SPEED)
	leftDomain = leftDomain > endDay ? endDay : leftDomain;
	var rightDomain = addHours(leftDomain, SCREENHOURS);
	xScale.domain([leftDomain, rightDomain])
	/*svg.select(".x-axis")
		.call(d3.axisBottom(xScale));*/
	svg.selectAll(".datapath")
		.attr("d", d3.line()
			.curve(d3.curveStepAfter)
			.x(function(d) { return xScale(d.date) })
			.y(function(d) { return yScale(d.rating) })
		)
}

function updateCircles(elapsed, data) {	
	var leftDomain = addHours(firstDay, elapsed*SPEED);
	leftDomain = leftDomain > endDay ? endDay : leftDomain;
	var circleDate = addHours(leftDomain, SCREENHOURS*0.8);
	svg.select("#CurrentDate").text(formatDate(circleDate));

	var low = 0, high = data.length-1;
	while (low < high-1) {
		var mid = Math.floor((low+high)/2);
		var value = data[mid].date;
		if (value < circleDate) {
			low = mid;
		} else if (value > circleDate) {
			high = mid;
		} else {
			break;
		}
	}

	for (var i = 0; i < N; i++) {
		svg.select("#circle"+i)
			.attr("class", data[low]["team"+(i+1)].replace(/\s|'/g, ""))
			.attr("cx", xScale(circleDate))
			.attr("cy", yScale(data[low]["rating"+(i+1)]))
		svg.select("#team"+i)
			.text(data[low]["team"+(i+1)])
			.attr("y", yScale(data[low]["rating"+(i+1)]))
	}
	
	for (var i = 0; i < N-1; i++) {
		var curr = svg.select("#team"+i);
		var next = svg.select("#team"+(i+1));
		if (next.attr("y") <= parseInt(curr.attr("y")) + 20) {
			next.attr("y", 20+parseInt(curr.attr("y"))); 
		}
	}
}