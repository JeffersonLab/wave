create database wave;

create user 'wave' IDENTIFIED BY 'password goes here';

grant select on wave.* to 'wave';

create table chart_config (
    chart_config_id int not null auto_increment primary key,
    user varchar(24) null,
    name varchar(32) not null,
    start timestamp null,
    end timestamp null,
    window_minutes int null,
    mya_deployment varchar(12) not null default 'ops',
    mya_limit int default 100000,
    layout_mode enum('separate', 'shared', 'shared_separate_axis') not null default 'separate',
    viewer_mode enum('fixed', 'live') not null default 'fixed',
    unique(user, name)
);

create table series_config (
    series_config_id int not null auto_increment primary key,
    chart_config_id int not null,
    weight int not null default 0,
    pv varchar(128) not null,
    label varchar(128) null,
    color varchar(128) null,
    y_axis_label varchar(128) null,
    y_axis_min float null,
    y_axis_max float null,
    y_axis_log_scale bool not null default false,
    scaler float null,
    foreign key (chart_config_id) references chart_config(chart_config_id) on delete cascade
);