
CREATE DATABASE IF NOT EXISTS SIMPLEDB DEFAULT CHARACTER SET = "UTF8";

CONNECT SIMPLEDB;

CREATE TABLE IF NOT EXISTS USERDATA (
  ID INT AUTO_INCREMENT UNIQUE PRIMARY KEY,
  APP VARCHAR(15) NOT NULL,
  USERNAME VARCHAR(255) NOT NULL,
  DATA TEXT,
  VERSION INT not null DEFAULT 1,
  LOCKEDBY VARCHAR(64),
  CREATIONDATE DATETIME NOT NULL DEFAULT now(),
  LASTUPDATE DATETIME NOT NULL DEFAULT now()
);


CREATE UNIQUE INDEX unameidx ON USERDATA(USERNAME, APP);

CREATE USER IF NOT EXISTS simpledbuser IDENTIFIED BY 'simpledbpw';

GRANT ALL ON simpledb.* TO simpledbuser@'%';

-- TESTDATEN
INSERT INTO USERDATA(APP, USERNAME, DATA)
  VALUES('test', 'feri1', '{status: "INIT"}');
INSERT INTO USERDATA(APP, USERNAME, DATA)
  VALUES('test', 'feri2', '{status: "PLAY"}');
