# RaspberryPi-IR
Raspberry Piを赤外線リモコンにするためのプログラム。

# ファイル一覧
- scan.c
	赤外線リモコンの信号をスキャンするプログラム。詳細は以下の記事から。
	[Raspberry PiのGPIOを利用して赤外線リモコンの信号をスキャン・送信](https://qiita.com/Hiroki_Kawakami/items/3f7d332797d188dc9022)
- send.c
	スキャンしたリモコンの信号を送るプログラム。詳細は以下の記事から。
	[Raspberry PiのGPIOを利用して赤外線リモコンの信号をスキャン・送信](https://qiita.com/Hiroki_Kawakami/items/3f7d332797d188dc9022)
- aeha.c
	スキャンした家製協フォーマットのリモコンの信号を16進数のバイト列に変換するプログラム。詳細は以下の記事から。
	[Raspberry Piで三菱のエアコンのリモコンをスキャン・解析・送信してみる](https://qiita.com/Hiroki_Kawakami/items/37cdb412a4e511a58103)
- mbac.js
	三菱エアコンのリモコンの信号を生成するプログラム。詳細は以下の記事から。
	[Raspberry Piで三菱のエアコンのリモコンをスキャン・解析・送信してみる](https://qiita.com/Hiroki_Kawakami/items/37cdb412a4e511a58103)
- mbac_web.js
	三菱エアコンをWebブラウザから操作するためのプログラム。詳細は以下の記事から。
	[Raspberry Piで三菱のエアコンをブラウザから操作する](https://qiita.com/Hiroki_Kawakami/items/760a7a30998385d5b0fd)
