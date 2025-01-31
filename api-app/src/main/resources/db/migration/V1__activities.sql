CREATE TABLE activities (
  timestamp timestamp WITH TIME ZONE NOT NULL,
  duration numeric NOT NULL,
  client varchar(200) NOT NULL,
  project varchar(200) NOT NULL,
  task varchar(200) NOT NULL,
  notes varchar(500),

  PRIMARY KEY (timestamp)
);
