<?php

class DB
{
	private $_DB = null;
	private $_SQL = null;
	private $_result = [];
	function __construct($file)
	{
		$this->_DB = new SQLite3($file);
	}

	public function es($var)
	{
		return $this->_DB->escapeString($var);
	}

	private function sql($var)
	{
		$this->_SQL = $var;
	}

	private function getSQL()
	{
		return $this->_SQL;
	}

	private function result($var)
	{
		$this->_result = $var;
	}

	private function getResult($attr = false)
	{
		return ($attr === false ? $this->_result : $this->_result[$attr]);
	}

	public function q($sql = false)
	{
		if ($sql) $this->sql($sql);
		$this->result($this->_DB->exec($this->getSQL()));
		// $this->result(array_merge(['status' => $this->rd()], $this->rAD()));
		// $this->getResult();
	}

	public function qf_assoc($sql = false, $return = false)
	{
		if ($sql) $this->sql($sql);
		$this->result($this->_DB->querySingle($this->getSQL(), 1));
		if ($return)
			return $this->rD();
	}

	private function getArray()
	{
		$arr = [];
		['SQLITE3_NUM', 'SQLITE3_ASSOC', 'SQLITE3_BOTH'];
		// echo pre($this->rd());
		while ($row = $this->rD()->fetchArray(SQLITE3_ASSOC)) {
			$arr[] = $row;
			if (empty($row)) break;
		}
		$this->result($arr);
	}

	public function qf_array($sql, $return = false)
	{
		if ($sql) $this->sql($sql);
		$this->result($this->_DB->query($this->getSQL()));
		$this->getArray();
		if ($return)
			return $this->rD();
	}

	public function rD($attr = false)
	{
		return ($attr == -1 ? $this->rAD() : $this->getResult($attr));
	}

	private function rAD()
	{
		return [
			'changes' => $this->_DB->changes(),
			'lastErrorCode' => $this->_DB->lastErrorCode(),
			'lastErrorMsg' => $this->_DB->lastErrorMsg(),
		];
	}
}
