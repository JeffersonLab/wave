create database wave;

create user 'wave' IDENTIFIED BY 'password goes here';

grant select on wave.* to 'wave';

create table chart (
    chart_id bigint not null auto_increment primary key,
    user varchar(24) null,
    name varchar(32) not null,
    start timestamp null,
    end timestamp null,
    window_minutes int not null default 30,
    mya_deployment varchar(12) not null default 'ops',
    mya_limit bigint not null default 100000,
    layout_mode enum('separate', 'shared', 'shared_separate_axis') not null default 'separate',
    viewer_mode enum('fixed', 'live') not null default 'fixed',
    unique(user, name)
);

create table series (
    series_id bigint not null auto_increment primary key,
    chart_id bigint not null,
    weight smallint not null default 0,
    pv varchar(128) not null,
    label varchar(128) null,
    color varchar(128) null,
    y_axis_label varchar(128) null,
    y_axis_min float null,
    y_axis_max float null,
    y_axis_log_scale bool not null default false,
    scaler float null,
    foreign key (chart_id) references chart(chart_id) on delete cascade
);