select *, maze_time_highscore as score from users
where maze_time_highscore > 0
order by maze_time_highscore ASC
