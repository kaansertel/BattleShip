# BattleShip Game 
Amiral battı (Battleship), **`2`** kişilik strateji ve düşünce tabanlı bir oyundur. Her oyuncu gemi filosunu diğer oyuncudan gizlediği, önceden **`dikey`** ve **`yatay`** koordinatların belirli olduğu bir alanda oynar. Oyuncular sırasıyla koordinat belirtip **`atış`** yaparlar ve diğer oyuncunun gemilerinin yerlerini bulup batırmaya çalışırlar.

## Oyun Kuralları
 - Her bir oyuncu için 10x10 şeklinde, 100 karelik bir alan oluşturulmalıdır.
 - Bütün oyuncular, kendi alanları içerisinde gemilerini yatay ve dikey olarak yerleştirmelidir.
 - Eğer yapılan atış başarısız olursa, karşı taraf hamle sırasını elde eder.
 - Bir kişinin bütün gemileri batana kadar oyuna devam edilmelidir.

## Gemiler
| Adet | Gemi | Kapladığı Alan |
|------|------|----------------|
|   1  |Amiral Gemisi|       5        |
|   1  |Kruvazör Gemisi|       4        |
|   2  |Muhrip Gemisi|       3        |
|   1  |Denizaltı Gemisi|       2        |

## Görüntüler
```sh
Anasayfa Görüntüsü
```
![Anasayfa](https://github.com/kaansertel/BattleShip/blob/master/images/01_Anasayfa.jpg)

```sh
Sol kısımdaki bölüm bizim gemilerimizi yerleştireceğimiz bölümdür
Sağ kısımdaki board ise Bilgisayarın gemilerini yerleştirdiği bölümdür
``` 

![SinglePlayer](https://github.com/kaansertel/BattleShip/blob/master/images/02_SinglePlayer.jpg)

```sh
“Rotate Your Ships” buttonuyla gemilerimizi çevirebilir
Bu sayede kendi alanımıza çevrilmiş gemilerimizi istediğimiz şekilde yerleştirebiliriz
``` 
![Rotate](https://github.com/kaansertel/BattleShip/blob/master/images/04_RotateShip.jpg)

```sh
“Start Game” buttonuna basarak oyuna başlayabiliriz
Rakibimizin alanına bir atış yaparız
Eğer bu atış siyah ise ıskalamış oluruz ve sıra rakibe (bilgisayara) geçer ve o bizim alanımıza bir atış yapar
Eğer atış kırmızı ise isabet ettirmiş oluruz ve atış hakkı yine bizde kalır
Iskalayana kadar atış yapılabilir
Rakibin bütün gemilerini batıran oyunu kazanmış olur
``` 
![05](https://github.com/kaansertel/BattleShip/blob/master/images/05.png)

```sh
"Multiplayer" kısmına girildiği zaman karşılaşılan ‘Room List’ bölümünü görebilmekteyiz
Bu bölümde kullanıcılar sağ tarafta bulunan kısımdan bir isim girerek o isimde bir oda oluşturabilirler
```
![06](https://github.com/kaansertel/BattleShip/blob/master/images/11.png)

```sh
Her odaya en fazla 2 kişi katılabilmektedir
3. Kişi katılmak istediğinde odaya katılımı gerçekleşmemekte ve tekrardan bu ekrana yönlendirilmektedir
Search kısmından oda araması yapabilmekte ve istediğimiz sayıda (10, 25, 50, 100) şeklinde odalar listelenebilmektedir
Oda ismi isin belirli filtrelemeler bulunmaktadır
Arka planda oda isminin max uzunluğu 20 olarak verilmiştir ve büyük harf dahi girilse küçük harflere dönüştürülmektedir
Ayrıca aynı isimde başka bir odanın açılmasına da izin vermemektedir
```
![07](https://github.com/kaansertel/BattleShip/blob/master/images/12.png)

```sh
Kullanıcı uygun olan bir odaya Join dediğinde karşılaşacağı ekranı görmektesiniz
Karşılıklı olarak haberleşme Socket.IO ile sağlanmaktadır
 1. Oyuncu bağlandığı zaman Connected yazısı aktif olmaktadır
Gemilerini yerleştirip “Start Game” buttonuna bastığı zamanda Ready kısmı aktif olmaktadır
Aynı şeyler 2. Oyuncu içinde geçerlidir
İki oyuncuda hazır hale geldiğinde oyunumuz başlayacaktır
```
![08](https://github.com/kaansertel/BattleShip/blob/master/images/6.png)




