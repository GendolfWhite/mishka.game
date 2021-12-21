<?php

// namespace Classes\Вb;

class Db
{

	private $link;
	private $query;
	private $result;
	private $data;

	function __construct($dbuser = false, $dbpass = false, $dbname = false, $dbhost = 'localhost')
	{
		if ($dbuser != false && $dbpass != false && $dbname != false)
			$this->connect($dbuser, $dbpass, $dbname, $dbhost);
	}

	public function connect($dbuser, $dbpass, $dbname, $dbhost = 'localhost')
	{
		$this->link = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);
		if (!$this->link) {
			// printf("Connect failed: %s\n", mysqli_connect_error());
			die($this->display_error(mysqli_error($this->link), mysqli_errno($this->link), mysqli_connect_error()));
			exit();
		}
		$this->q("set charset utf8");
	}

	public function es($var)
	{ // escape_string
		if (is_array($var)) {
			foreach ($var as $key => $value) {
				$var[$key] = mysqli_real_escape_string($this->link, $value);
			}
		} else {
			$var = mysqli_real_escape_string($this->link, $var);
		}
		return $var;
	}

	private function setQuery($query)
	{
		$this->query = $query;
	}

	private function getSql()
	{
		$this->result = @mysqli_query($this->link, $this->query) or die($this->display_error(mysqli_error($this->link), mysqli_errno($this->link), $this->query));
	}

	private function setData($data)
	{
		$this->data = $data;
	}

	private function clearData()
	{
		$this->data = '';
	}

	private function getAssoc()
	{
		$this->clearData();
		$this->setData(mysqli_fetch_assoc($this->result));
	}

	private function getArray()
	{
		$this->clearData();
		$i = 0;
		$array = array();
		while ($i < $this->result->num_rows) {
			$array[] = mysqli_fetch_array($this->result, MYSQLI_ASSOC);
			$i++;
		}
		$this->setData($array);
	}

	public function q($query, $r_id = true)
	{
		$this->setQuery($query);
		$this->getSql();
		if ($r_id) return $this->insert_id();
	}

	public function insert_id()
	{
		return mysqli_insert_id($this->link);
	}

	public function qf_assoc($query, $return = 0)
	{
		$this->setQuery($query);
		$this->getSql();
		$this->getAssoc();
		if ($return) return $this->returnData();
	}

	public function returnData($who = false)
	{
		if (!$who)
			return $this->data;
		else
			return $this->data[$who];
	}

	public function rD($who = false)
	{
		if (!$who)
			return $this->data;
		else
			return $this->data[$who];
	}

	public function qf_array($query, $return = 0)
	{
		$this->setQuery($query);
		$this->getSql();
		$this->getArray();
		if ($return) return $this->returnData();
	}

	private function display_error($error, $error_num, $query = '')
	{
		if ($query) {
			$query = preg_replace("/([0-9a-f]){32}/", "********************************", $query);
		}

		$query = htmlspecialchars($query, ENT_QUOTES, 'ISO-8859-1');
		$error = htmlspecialchars($error, ENT_QUOTES, 'ISO-8859-1');

		$trace = debug_backtrace();
		$level = 0;
		if ($trace[1]['function'] == "query") $level = 1;
		if ($trace[2]['function'] == "super_query") $level = 2;

		$_error = [
			'MySQL error' => $trace[$level]['file'],
			'at line' => $trace[$level]['line'],
			'Error Number' => $error_num,
			'The Error returned was' => $error,
			'SQL query' => $query,
		];

		// E::pre( $_error );

		$trace[$level]['file'] = str_replace(ROOT, "", $trace[$level]['file']);
		echo <<<HTML
	<!DOCTYPE html>
	<html>
	<head>
	<title>MySQL Fatal Error</title>
	<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
	<style type='text/css'>body{font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 11px; font-style: normal; color: #000000;}.wrap{width: 700px; margin: 20px; border: 1px solid #D9D9D9; background-color: #F1EFEF; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; -moz-box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3); -webkit-box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3); box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);}.top{color: #ffffff; font-size: 15px; font-weight: bold; padding-left: 20px; padding-top: 10px; padding-bottom: 10px; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.75); background-color: #AB2B2D; background-image: -moz-linear-gradient(top, #CC3C3F, #982628); background-image: -ms-linear-gradient(top, #CC3C3F, #982628); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#CC3C3F), to(#982628)); background-image: -webkit-linear-gradient(top, #CC3C3F, #982628); background-image: -o-linear-gradient(top, #CC3C3F, #982628); background-image: linear-gradient(top, #CC3C3F, #982628); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#CC3C3F', endColorstr='#982628',GradientType=0 ); background-repeat: repeat-x; border-bottom: 1px solid #ffffff;}.box{margin: 10px; padding: 4px; background-color: #EFEDED; border: 1px solid #DEDCDC;}</style>
	</head>
	<body>
	<div class='wrap'>
		<div class='top'>MySQL Error!</div>
		<div class='box'><b>MySQL error</b> in file: <b>{$trace[$level]['file']}</b> at line <b>{$trace[$level]['line']}</b></div>
		<div class='box'>Error Number: <b>{$error_num}</b></div>
		<div class='box'>The Error returned was:<br /> <b>{$error}</b></div>
		<div class='box'><b>SQL query:</b><br /><br />{$query}</div>
	</div>
	</body>
	</html>
HTML;
		exit();
	}
}
