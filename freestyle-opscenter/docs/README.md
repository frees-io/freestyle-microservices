# Freestyle microservice: Opscenter

* * * 

* [1. Overview](#1-overview) 
* [2. Kafka related info](#2-kafka-related-info) 
* [3. Cassandra related info](#3-cassandra-related-info)
* [4. Tools & APIs](#4-tools-apis)
* [5. Monitoring frameworks](#5-monitoring-frameworks)
* [6. Visualization and data presentation](#6-visualization-and-data-presentation)
* [7. Full commercial solutions](#7-full-commercial-solutions) 
* [8. Freestyle proposal](#8-freestyle-proposal) 

* * * 

## 1. Overview

Talking about services monitoring and metrics data handling implies three things or actions to consider:

   * Collecting

   * Storing/maintaining/querying

   * Visualizing

On a first approach we are taking the data-storing the off the table, so we have to focus on the other two key concepts, collecting the data and visualizing it.

Hence, firstly, we need to find a proper format of data representation. Some possible monitoring/time-values data formats are detailed following.

#### 1.1. Data formats

* ##### Codahale Metrics (used internally by Cassandra)

Java based

http://metrics.dropwizard.io/3.1.0/manual/core/

* ##### InfluxDB line protocol
	
`<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]`

```
weather,location=us-midwest temperature=82 1465839830100400200
  |    -------------------- --------------  |
  |             |             |             |
  |             |             |             |
+-----------+--------+-+---------+-+---------+
|measurement|,tag_set| |field_set| |timestamp|
+-----------+--------+-+---------+-+---------+
```


https://docs.influxdata.com/influxdb/v1.3/write_protocols/line_protocol_tutorial/
https://docs.influxdata.com/influxdb/v1.3/write_protocols/line_protocol_reference/


* ##### Prometheus, OpenTSDB

`<metric> <timestamp> <value> <tagk1=tagv1[ tagk2=tagv2 ...tagkN=tagvN]>`

`sys.cpu.user 1356998400 42.5 host=webserver01 cpu=0`

Every time series data point requires the following data:

   * *metric* - A generic name for the time series such as sys.cpu.user, stock.quote or env.probe.temp.
   * *timestamp* - A Unix/POSIX Epoch timestamp in seconds or milliseconds defined as the number of seconds that have elapsed since January 1st, 1970 at 00:00:00 UTC time. Only positive timestamps are supported at this time.
   * *value* - A numeric value to store at the given timestamp for the time series. This may be an integer or a floating point value.
   * *tag(s)* - A key/value pair consisting of a tagk (the key) and a tagv (the value). Each data point must have at least one tag.

http://opentsdb.net/docs/build/html/user_guide/writing.html#data-specification

* ##### Graphite

The graphite plaintext format are messages of the following form: 

`<metric path> <metric value> <metric timestamp>`

So for example, `foo.bar.baz 42 74857843` where the last number is a UNIX epoch time.

http://graphite.readthedocs.io/en/latest/feeding-carbon.html

* ##### CollectD

Based internally on [`value_list_t`](https://collectd.org/wiki/index.php/Value_list_t)  and [`data_set_t`](https://collectd.org/wiki/index.php/Data_set_t), but a way to interact externally with the daemon is through the plaintext protocol: 

`Identifier [OptionList] Valuelist`

`"testhost/interface/if_octets-test0" interval=10 1179574444:123:456`

The OptionList is an optional list of Options, where each option is a key-value-pair. A list of currently understood options can be found below, all other options will be ignored. Values that contain spaces must be quoted with double quotes.

Valuelist is a colon-separated list of the time and the values, each either an unsigned integer if the data source is of type COUNTER or ABSOLUTE(*), a signed integer if the data source is of type DERIVE(*) or a double if the data source is of type GAUGE. You can submit an undefined GAUGE value by using “U”. When submitting “U” to a COUNTER the behavior is undefined. The time is given as epoch (i. e. standard UNIX time). You can use “N” instead of a time in epoch which is interpreted as “now”.

You can mix options and values, but the order is important: Options only effect following values, so specifying an option as last field is allowed, but useless. Also, an option applies to all following values, so you don’t need to re-set an option over and over again. 

https://collectd.org/wiki/index.php/Plain_text_protocol

* ##### Ganglia/RRDtool

Ganglia leverages widely used technologies such as XML for data representation, XDR for compact, portable data transport, and RRDtool for data storage and visualization.

https://github.com/ganglia/monitor-core/wiki/Ganglia-Documents
https://github.com/ganglia/ganglia_contrib/blob/master/gmond-debug/spec/gmond_sample.xml
http://rrdtool.vandenbogaerdt.nl/tutorial/rrdupdate.php


#### 1.2. Data content

What could be interesting to monitor? (based on what GCP monitors actually)

	* Generic JMX metrics, relevant for both Kafka and/or Cassandra
		* Active JVM Threads
	   	* JVM Heap memory usage
	   	* JVM Non-Heap memory usage
	   	* JVM Open File Descriptors
	   	* JVM Garbage Collection Count
	   	
	* Kafka
		* Message In Rate
		* Bytes In/Out Rate
	  	* Request Rate
	   	* Log Flush Rate
	   	* ISR Expansion and Shrink Rate
	   	* Request times
	
	* Cassandra 
	    * Storage Load: The amount of data stored on each Cassandra node.
	    * Pending Tasks: The number of basic task stages waiting to run.
	    * Active Tasks: The number of basic task stages currently running.
	    * Blocked Tasks: The number of basic task stages blocked from running.
	    * Pending Internal Tasks: The number of internal task stages waiting to run.
	    * Active Internal Tasks: The number of internal task stages currently running.```


Source: https://cloud.google.com/monitoring/agent/plugins/



#### 1.3. Monitoring 101

This is a basic but also broad article on elementary concepts around monitoring, written by Datadog team engineers:

[Monitoring 101](https://www.datadoghq.com/blog/monitoring-101-collecting-data/) 


## 2. Kafka related info

For Kafka, on a first approach there are two routes apparently as Kafka exposes metrics though JMX and also exposes some metrics through its REST interface (though thereis JMX metrics underlying).

#### 2.1. Documentation and posts

* [Kafka monitoring documentation](https://kafka.apache.org/documentation.html#monitoring) 
Kafka uses Yammer Metrics for metrics reporting in both the server and the client. This can be configured to report stats using pluggable stats reporters to hook up to your monitoring system.
The easiest way to see the available metrics is to fire up jconsole and point it at a running kafka client or server; this will allow browsing all metrics with JMX. 

* [Netflix dedicated monitoring service for Kafka](https://medium.com/netflix-techblog/kafka-inside-keystone-pipeline-dd5aeabaf6bb) 
*Not open sourced AFAIA* - Tech blog post.

* [How to monitor Kafka](https://softwaremill.com/monitoring-apache-kafka-with-influxdb-grafana/) 
Post explaining how to monitor Kafka with Grafana, InfluxDB through JMX.

* *Monitoring Kafka* post series from Datadog:
	* [Part 1, monitoring Kafka performance metrics](https://www.datadoghq.com/blog/monitoring-kafka-performance-metrics/) 
	* [Part 2, collecting Kafka performance metrics ](https://www.datadoghq.com/blog/collecting-kafka-performance-metrics/) 
	* [Part 3, monitoring Kafka with Datadog](https://www.datadoghq.com/blog/monitor-kafka-with-datadog/) 
	
* The Kafka REST way: 
	* [Kafka REST proxy monitoring Confluent docs](http://docs.confluent.io/current/kafka-rest/docs/monitoring.html#) 
	The REST proxy reports a variety of metrics through JMX. It can also be configured to report stats using additional pluggable stats reporters using the metrics.reporters configuration option.
The easiest way to view the available metrics is to use jconsole to browse JMX MBeans. In addition to the metrics specific to the REST proxy listed below, you can also view and monitor the metrics for the underlying producers and consumers.
The REST proxy has two types of metrics. Global metrics help you monitor the overall health of the service. Per-endpoint metrics monitor each API endpoint request method and are prefixed by a name of the endpoint (e.g. brokers.list). These help you understand how the proxy is being used and track down specific performance problems.
In addition to the metrics defined below, the REST proxy also exposes the wealth of metrics that are provided by the underlying Jetty server.
	* [Kafka REST proxy documentation](https://github.com/confluentinc/kafka-rest) 
	The Kafka REST Proxy provides a RESTful interface to a Kafka cluster. It makes it easy to produce and consume messages, view the state of the cluster, and perform administrative actions without using the native Kafka protocol or clients. Examples of use cases include reporting data to Kafka from any frontend app built in any language, ingesting messages into a stream processing framework that doesn't yet support Kafka, and scripting administrative actions.
	* [Kafka topics](https://github.com/Landoop/kafka-topics-ui) -> [Live demo](http://kafka-topics-ui.landoop.com/) 


#### 2.2. Kafka monitoring projects

* [Kafka manager](https://github.com/yahoo/kafka-manager)
A tool for managing Apache Kafka. Support a lot of operations along offering different information.

* [Kafka monitor](https://github.com/linkedin/kafka-monitor)
Kafka Monitor is a framework to implement and execute long-running kafka system tests in a real cluster. It complements Kafka’s existing system tests by capturing potential bugs or regressions that are only likely to occur after prolonged period of time or with low probability. Moreover, it allows you to monitor Kafka cluster using end-to-end pipelines to obtain a number of derived vital stats such as end-to-end latency, service availability and message loss rate. You can easily deploy Kafka Monitor to test and monitor your Kafka cluster without requiring any change to your application. 
Kafka Monitor can automatically create the monitor topic with the specified config and increase partition count of the monitor topic to ensure partition# >= broker#. It can also reassign partition and trigger preferred leader election to ensure that each broker acts as leader of at least one partition of the monitor topic. This allows Kafka Monitor to detect performance issue on every broker without requiring users to manually manage the partition assignment of the monitor topic.

* [Burrow](https://github.com/linkedin/Burrow)
A monitoring companion for Apache Kafka that provides consumer lag checking as a service without the need for specifying thresholds. It monitors committed offsets for all consumers and calculates the status of those consumers on demand. An HTTP endpoint is provided to request status on demand, as well as provide other Kafka cluster information. There are also configurable notifiers that can send status out via email or HTTP calls to another service.

* [Kafka Metrics](https://github.com/amient/kafka-metrics)
Real-time aggregation of metrics from large distributed systems. Rather than replacing existing monitoring solutions it fulfills the role of `real-time distributed aggregation` to combine metrics from multiple systems, with some out-of-the-box features for data streams pipelines based on Apache Kafka.

* [Microsoft Kafka availability monitor](https://github.com/Microsoft/Availability-Monitor-for-Kafka) 
Availability monitor for Kafka allows you to monitor the end to end availability and latency for sending and reading data from Kafka. Producer Availability is defined as (Number of successful message sends accross all Topics and Partitions)/(Number of message send attempts) Consumer Availability is defined as (Number of successfull tail data reads accross all Topics and Partitions)/(Number of read attempts)
The tool measures Producer availability and latency by sending canary messages to all partitions. The message prefix is "CanaryMessage_" and can be changed in the producerProperties.json resource file. The tool measures Consumer availability and latency by reading data from the tail of all partitions.


 
## 3. Cassandra related info
Cassandra also exposes all its metrics via JMX, though since version  2.0.2 it has provided the built-in feature of _Pluggable Metrics Reporting_ that can expose internal Cassandra metrics on the fly to different metrics reporters such as CSV, console, Graphite, Ganglia, and so on.

* [Cassandra monitoring documentation](http://cassandra.apache.org/doc/latest/operating/metrics.html)
Metrics in Cassandra are managed using the Dropwizard Metrics library. These metrics can be queried via JMX or pushed to external monitoring systems using a number of built in and third party reporter plugins.
Metrics are collected for a single node. It’s up to the operator to use an external monitoring system to aggregate them.

* [Nodetool](http://docs.datastax.com/en/archived/cassandra/3.x/cassandra/tools/toolsNodetool.html)
Basic tool bundled in the Cassandra distribution for node management and statistics gathering. Under the hood it is just a Python console application. Nodetool shows cluster status, compactions, bootstrap streams and much more. It is a very important source of information, but it's just a CLI tool without any storage or visualization capabilities. 


## 4. Tools & APIs
* [JMXProxy](https://github.com/mk23/jmxproxy) 
JMXProxy exposes all available MBean attributes on a given JVM via simple HTTP request. The results are in easily-parsable JSON format. The server component is built using Dropwizard.

* [Jolokia](https://jolokia.org/) 
A JMX-HTTP bridge giving an alternative to JSR-160 connectors. It is an agent based approach with support for many platforms. In addition to basic JMX operations it enhances JMX remoting with unique features like bulk requests and fine grained security policies. 

* [Nmon](http://nmon.sourceforge.net/)
A computer performance system monitor tool for the AIX and Linux operating systems developed by IBM employee Nigel Griffiths. The tool displays onscreen or saves to a data file the operating system statistics to aid the understanding of computer resource use, tuning options and bottlenecks.

* [Prometheus](https://prometheus.io/)
A systems and service monitoring system. It collects metrics from configured targets at given intervals, evaluates rule expressions, displays the results, and can trigger alerts if some condition is observed to be true.

* [StatsD](https://github.com/etsy/statsd)
A network daemon that runs on the Node.js platform and listens for statistics, like counters and timers, sent over UDP or TCP and sends aggregates to one or more pluggable backend services (e.g., Graphite).


## 5. Monitoring frameworks
* [Graphite](http://graphiteapp.org/) 
An enterprise-scale monitoring tool, it does two things: Store numeric time-series data and render graphs of this data on demand. What Graphite does not do is collect data for you, however there are some tools out there that know how to send data to graphite. Even though it often requires a little code, sending data to Graphite is very simple.

* [Snap](https://github.com/intelsdi-x/snap) 
Snap is an open telemetry framework designed by Intel to simplify the collection, processing and publishing of system data through a single API.



## 6. Visualization and data presentation
* [Grafana](https://grafana.com)
An open source, feature rich metrics dashboard and graph editor for Graphite, Elasticsearch, OpenTSDB, Prometheus and InfluxDB.
Also https://github.com/raintank/snap-app

* [Collectd graph panel](https://pommi.nethuis.nl/category/cgp/)
A graphical web-based front-end for visualizing RRD collected by collectd, written in the PHP language.

* [Facette](https://facette.io/) 
An open source web application to display time series data from various sources — such as collectd, Graphite, InfluxDB or KairosDB — on graphs.

* [Rickshaw](http://code.shutterstock.com/rickshaw/) 
A JavaScript toolkit for creating interactive time series graphs.


## 7. Full commercial solutions

* [Confluent Control Center](https://www.confluent.io/product/control-center/)
* [Server Density](https://www.serverdensity.com/)
* [Datadog](https://www.datadoghq.com/)
* [Sematex SPMt](https://sematext.com/spm/) 
* [SignalFX](https://signalfx.com/kafka-monitoring/)
	* [SignalFX collectd Kafka plugin](https://github.com/signalfx/integrations/tree/master/collectd-kafka) 
Kafka plugin for collectd. It will send data about Kafka to SignalFx, enabling built-in Kafka monitoring dashboards.
	* [How We Monitor and Run Kafka At Scale](https://www.confluent.io/blog/how-we-monitor-and-run-kafka-at-scale-signalfx/)
	
## 8. Freestyle proposal

As we are looking for the best format from an interoperability and reusability point of view, we have decided to follow the **InfluxDB** data format as the base data structure in the first approach of our Freestyle ops-center.

Based on this format we can later process the data with other powerful tools like Grafana or others, and just have a visualization with lower scope tools like Facette.