CREATE TABLE activities (
  timestamp TIMESTAMP WITH TIME ZONE PRIMARY KEY,
  duration  INTERVAL SECOND(12)      NOT NULL,
  client    VARCHAR(200)             NOT NULL,
  project   VARCHAR(200)             NOT NULL,
  task      VARCHAR(200)             NOT NULL,
  notes     VARCHAR(500)
);
