<?php
if (isset($_GET['act']) && $_GET['act'] == 'result') {
	function getIP()
	{
		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			$ip = $_SERVER['HTTP_CLIENT_IP'];
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		} else {
			$ip = $_SERVER['REMOTE_ADDR'];
		}
		return $ip;
	}

	function pre($var)
	{
		echo "<pre>";
		print_r($var);
		echo "</pre>";
	}

	function json($var, $decode = false)
	{
		return ($decode ? json_decode($var) : json_encode($var));
	}

	ini_set('date.timezone', 'Asia/Krasnoyarsk');

	require_once __DIR__ . '/db/sqlite3.class.php';

	$DB = new DB(__DIR__ . '/db/game.db');

	$DB->q("CREATE TABLE IF NOT EXISTS `results` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `instagram` TEXT, `date` TEXT, `score` INTEGER, `ip` TEXT);");

	if (isset($_GET['load'])) {
		$DB->qf_array("SELECT * FROM `results` ORDER BY `score` DESC LIMIT 100");
	} else {
		if (isset($_POST['save'])) {
			$score = $DB->es($_COOKIE['score']);
			$instagram = $DB->es($_COOKIE['instagram']);
			$date = $DB->es(date('Y-m-d H:i:s'));
			$ip = $DB->es(getIP());
			$SQL = "INSERT INTO `results` (`instagram`, `score`, `date`, `ip`) VALUES ('{$instagram}', '{$score}', '{$date}', '{$ip}')";
			$DB->q($SQL);
		}
	}

	echo json($DB->rD());

	die();
}
?>

<!DOCTYPE html>
<html lang="ru">

<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Игра.МишкаБар.рф</title>
	<meta name="description" content="А почему бы и да?! Новый год не за горами. Пора готовиться! Предлагаем сыграть тебе в игру и, если повезет, то, получить приятный приз от нашего бара! Итоги подведем ночью 1 января!" />
	<meta name="owner" content="info@gfwe.ru">
	<meta name="author" content="Stiven.Kolenz">
	<meta name="resourse-type" content="Document">
	<meta name="revisit-after" content="4 days">
	<meta name="robots" content="all">
	<meta name="Generator" content="GFWE.CMS">
	<meta name="site-created" content="20.12.2021">

	<meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' />

	<link rel="canonical" href="https://игра.мишкабар.рф/" />
	<meta property="og:locale" content="ru_RU" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Игра.МишкаБар.рф - Почти как КВН, но только лучше!" />
	<meta property="og:url" content="https://игра.мишкабар.рф/" />
	<meta property="og:site_name" content="Игра.МишкаБар.рф" />
	<meta property="article:modified_time" content="2021-12-21T09:27:52+00:00" />
	<meta property="og:image" content="https://игра.мишкабар.рф/images/og-image.jpg" />
	<meta property="og:image:width" content="954" />
	<meta property="og:image:height" content="646" />
	<meta name="twitter:card" content="summary_large_image" />

	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta name="apple-mobile-web-app-title" content="GFWE.Team">
	<meta name="application-name" content="GFWE.Team">
	<meta name="mobile-web-app-capable" content="yes">

	<link rel="apple-touch-icon" sizes="57x57" href="/images/manifest/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/images/manifest/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/images/manifest/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/images/manifest/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/images/manifest/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/images/manifest/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/images/manifest/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/images/manifest/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/images/manifest/apple-icon-180x180.png">
	<link rel="icon" type="image/png" sizes="192x192" href="/images/manifest/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/images/manifest/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="/images/manifest/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/images/manifest/favicon-16x16.png">
	<link rel="manifest" href="/manifest.json">
	<meta name="msapplication-TileColor" content="#004850">
	<meta name="msapplication-TileImage" content="/images/manifest/ms-icon-144x144.png">
	<meta name="theme-color" content="#004850" />
	<link rel="shortcut icon" href="/favicon.ico">
	<link rel="icon" sizes="192x192" href="/images/favicon/favicon-192.png">
	<link rel="apple-touch-icon" href="/images/favicon/favicon-192.png">
	<meta name="msapplication-square310x310logo" content="/images/favicon
	favicon/favicon-310.png">

	<link rel="stylesheet" href="/css/style.css?ver=<?= filemtime(__DIR__ . '/css/style.css') ?>">
	<script src="/js/app.js?ver=<?= filemtime(__DIR__ . '/js/app.js') ?>"></script>
</head>

<body class="Preloader flex flex--fdc flex--aic flex--jcs">
	<a href="/" class="Logotype Preloader__logotype flex flex--aic flex--jcc"><img src="/images/logotypeIco.png" alt="" class="Logotype__icon"><img src="/images/logotypeText.png" alt="" class="Logotype__text"></a>
	<header class="Head">
		<div class="Head__wrap wrap flex flex--aic flex--jcc">
			<a href="/" class="Head__logotype Logotype flex flex--aic flex--jcc">
				<img src="/images/logotypeIco.png" alt="" class="Logotype__icon">
				<img src="/images/logotypeText.png" alt="" class="Logotype__text">
			</a>
			<div class="Head__socs HeadSocs flex flex--aic flex--jcc">
				<div class="HeadSocs__item">
					<a href="https://www.instagram.com/mishka_tsk/" data-href="instagram://user?username=mishka_tsk" target="_blank" class="HeadSocs__link HeadSocs__link--instagram">
						<svg class="HeadSocs__icon" viewBox="0 0 58 58">
							<g>
								<path d="M28.2,16.7c-7,0-12.8,5.7-12.8,12.8s5.7,12.8,12.8,12.8S41,36.5,41,29.5S35.2,16.7,28.2,16.7z M28.2,37.7 c-4.5,0-8.2-3.7-8.2-8.2s3.7-8.2,8.2-8.2s8.2,3.7,8.2,8.2S32.7,37.7,28.2,37.7z" />
								<circle cx="41.5" cy="16.4" r="2.9" />
								<path d="M49,8.9c-2.6-2.7-6.3-4.1-10.5-4.1H17.9c-8.7,0-14.5,5.8-14.5,14.5v20.5c0,4.3,1.4,8,4.2,10.7c2.7,2.6,6.3,3.9,10.4,3.9 h20.4c4.3,0,7.9-1.4,10.5-3.9c2.7-2.6,4.1-6.3,4.1-10.6V19.3C53,15.1,51.6,11.5,49,8.9z M48.6,39.9c0,3.1-1.1,5.6-2.9,7.3 s-4.3,2.6-7.3,2.6H18c-3,0-5.5-0.9-7.3-2.6C8.9,45.4,8,42.9,8,39.8V19.3c0-3,0.9-5.5,2.7-7.3c1.7-1.7,4.3-2.6,7.3-2.6h20.6 c3,0,5.5,0.9,7.3,2.7c1.7,1.8,2.7,4.3,2.7,7.2V39.9L48.6,39.9z" />
							</g>
						</svg>

					</a>
				</div>
				<div class="HeadSocs__item">
					<a href="https://t.me/mishka_tsk" data-href="tg://resolve?domain=mishka_tsk" target="_blank" class="HeadSocs__link HeadSocs__link--telegram">
						<svg class="HeadSocs__icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
							<path d="M24.19,27.11a1,1,0,0,1-.58-.18L14,20.19a1,1,0,0,1-.42-.73,1,1,0,0,1,.29-.8L16.49,16,12,18.81l2,4.59.88-.88a1,1,0,0,1,1.42,1.41L14.3,25.85a1,1,0,0,1-1.63-.31L9.78,18.8a1,1,0,0,1,.4-1.24L22.7,9.85a1,1,0,0,1,1.23,1.56l-7.82,7.82,7.44,5.22,4-17L5.78,15.55l2.41,1a1,1,0,1,1-.75,1.85L2.63,16.45a1,1,0,0,1,0-1.87L28.65,5a1,1,0,0,1,1,.19,1,1,0,0,1,.31,1L25.16,26.34a1,1,0,0,1-.62.71A1.07,1.07,0,0,1,24.19,27.11Z" />
						</svg>
					</a>
				</div>
			</div>
			<div class="Head__phone">
				<a href="tel:+73822977882"><span>+7 (3822) </span> 97-78-72</a>
			</div>
		</div>
	</header>
	<main class="Game flex flex--fdc flex--ais flex--jcs flex--fwn">
		<div class="Game__onlyMobile flex flex--aic flex--jcc">
			<h2>Как жаль что это приложение разработано только для мобильных устройств....</h2>
		</div>
		<section class="Game__info flex flex--aic flex--jcc hide">Ваш счет: <b>0</b></section>
		<section class="Game__field hide"></section>
		<section class="Game__start flex flex--fdc flex--aic flex--jcc flex--fwn">
			<div>
				<div class="startBox startBox--show" id='startText'>
					<h1>ИГРА В МИШЕЛЯ</h1>
					<h3>Почти как КВН, но только лучше!</h3>
					<br>
					<p>Привет, мой друг!<br>Совсем скоро уже наступит новый год и поэтому мы решили немного поиграть с вами в игры.</p>
					<a href="#" class="startBox__toggler Bttn">Читать инструкцию >></a>
				</div>
				<div id="manual" class="startBox startBox--hide startBox--absolute">
					<p>Твоя задача найти среди появляющихся картинок еду, напитки, ёлочные украшения и медведя. <br>Кликай по картинкам и они будут пропадать. А если ты будешь кликакть по нужным картинкам, то тебе будут начисляться баллы. <br> Чем больше баллов, тем ты круче!<br></p>
					<div class="startBox__items flex flex--aic flex--jcs">
						<div class="Game__item small Game__item--cocktail"></div>
						<div class="Game__item small Game__item--shot"></div>
						<div class="Game__item small Game__item--nybear--1"></div>
						<div class="Game__item small Game__item--nybear--3"></div>
						<div class="Game__item small Game__item--balls--1"></div>
						<div class="Game__item small Game__item--balls--2"></div>
						<div class="Game__item small Game__item--balls--3"></div>
						<div class="Game__item small Game__item--balls--4"></div>
						<div class="Game__item small Game__item--tree"></div>
						<div class="Game__item small Game__item--pizza--1"></div>
						<div class="Game__item small Game__item--pizza--2"></div>
					</div>
					<p>В новогоднюю ночь мы подведем итоги и вручим памятные призы топ-5 результатам :)</p>
					<a href="#" class="startBox__toggler Bttn">
						<< Назад</a>
				</div>
			</div>
		</section>
		<section class="Game__end wrap hide flex flex--fdc flex--aic flex--jcc">
			<p style='text-align: center;'>
				Ух ты! Вот это результат!!<br>
				У тебя <b>10</b> баллов!<br>
				Такому результату позавидовал бы даже сам Чак Норрис!<br><br>
			</p>
			<span>Введи свой адрес странички в инстаграм что бы мы сохранили твой результат в списке игроков :)</span>
			<form class="Game__save" id="save">
				<input type="hidden" name='score'>
				<input type="text" name='instagram' placeholder="логин или ссылка" required minlength="4">
			</form>
		</section>
		<section class="Game__bttns flex flex--aic flex--jcc">
			<button form="save" class="Game__bttn Game__bttn--save hide">Сохранить</button>
			<a href="#" class="Game__bttn Game__bttn--start">Начать игру</a>
			<a href="#" class="Game__bttn Game__bttn--start Game__bttn--restart hide">Заново</a>
			<a href="#" class="Game__bttn Game__bttn--results">Результаты</a>
		</section>
		<section class="Game__timer flex flex--aic flex--jcc hide">
			<b></b>
		</section>
		<section class="Game__results hide">
			<h2>Результаты [ТОП 100]</h2>
			<table>
				<thead>
					<tr>
						<th>#</th>
						<!-- <th>date</th> -->
						<th>Игрок</th>
						<th>Счет</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
			<a href="#" class="Bttn Game__bttn--results">Закрыть</a>
		</section>
	</main>
	<footer class="Footer">
		<div class="Footer__wrap wrap flex flex--aistr flex--jcc">
			<div class="Footer__copy"><a href="//МишкаБар.рф">МишкаБар.рф</a> ©&nbsp;2021</div>
			<div class="Footer__creator">Created by <a href="//instagram.com/stiven.kolenz" data-href="instagram://user?username=stiven.kolenz" target="_blank" class="Footer__link HeadSocs__link--instagram">GFWE.Team</a></div>
		</div>
	</footer>
</body>

</html>