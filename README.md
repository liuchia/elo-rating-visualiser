## Elo Rating Visualisation
Visualisation of top teams in the Premier League, treated as a pool in an Elo scheme. Calculating the elo for each team over the time period was done in Ruby, outputted to a .csv file and visualisations are done in javascript with usage of [d3.js](https://github.com/d3/d3).

### Elo Rating System
[Elo rating systems](https://en.wikipedia.org/wiki/Elo_rating_system) are used to calculate relative skill between players in competitive player vs player games, most notably in Chess and Video Games. All players start with a pre-chosen number of points, in my case 1500. Players that win gain points depending on the point difference between them and the loser - the lower relative ranking the loser, the less points they gain. The loser loses the same number of points. The points to take is calculated with the following formula : ![](https://latex.codecogs.com/gif.latex?K%5Cleft%20%28%20S_a%20-%20%5Cfrac%7BR_a%7D%7BR_a&plus;R_b%7D%20%5Cright%20%29) where ![](https://latex.codecogs.com/gif.latex?R_x%20%3D%2010%5E%7B%5Cfrac%7Brating_x%7D%7B400%7D%7D). a represents the team to calculate for and b its opposition. S<sub>a</sub> is 0 for a loss, 0.5 for a draw and 1 for a win. K is some constant that determines how much effect one game has.

### Input Data
Data was obtained from [here](http://www.football-data.co.uk/englandm.php). The code used to format the data for the elo calculating script is [here](./Computation/DataFormatter.rb).

### Visualisation
![Visualisation](https://i.imgur.com/NE7WOUd.gif)

Just messing around with d3.js.