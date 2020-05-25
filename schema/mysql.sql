create database wave;

create user 'wave' IDENTIFIED BY 'password goes here';

grant select on wave.* to 'wave';

create table chart_config (
    id int not null auto_increment primary key,
    user varchar(24),
    name varchar(32) not null,
    start timestamp null,
    end timestamp null,
    window_minutes int,
    mya_deployment varchar(12) not null default 'ops',
    mya_limit int,
    layout_mode enum('separate', 'shared', 'shared_separate_axis') not null default 'separate',
    viewer_mode enum('fixed', 'live') not null default 'fixed');

