const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000'); 

socket.emit('setParams', {
  username: 'murat45'
});
socket.emit('joinRoom', 'quiz'); 

socket.on('question', (question) => {
  console.log('Soru:', question);
});

socket.on('options', (options) => {
  console.log('Şıklar:', options);
});

socket.on('answer', (answer) => {
  console.log('Doğru cevap:', answer);
});


socket.on('waiting', (waiting) => {
  console.log('Bekle:', waiting);
});

socket.on('gameOver', (message) => {
  console.log('Oyun Bitti:', message);
});

socket.on('countdown', (message) => {
  console.log('Süre:', message);
});


socket.on('gameOver', (sortedUsers) => {
  //Sadece ilk 10 Kullanıcı
  console.log('Sıralanmış Kullanıcılar :', sortedUsers);

  sortedUsers.forEach((user, index) => {
      console.log(`Sıra ${index + 1}: Kullanıcı Adı: ${user.username}, Puan: ${user.score}`);
  });
});

socket.emit('getScore');
//Client getScore ile sunucudan puan istiyor
// Sunucuda getScore tetklendiği zaman clienta cevap olarak kullanıcının scoreunu gonderir
socket.on('userScore', (userScore) => {
    console.log(`Kullanıcının puanı: ${userScore}`);
    
});

const customQuestions = [
  { question: 'Blockchain Sorusu 1: Blok zinciri nedir ve nasıl çalışır?', answer: 'Doğru Cevap :Blok zinciri, bağlı bloklardan oluşan bir veri yapısıdır. Her bir blok, önceki bloğun hash değerini içerir ve kendisinin hash değeri önceki bloğun hash değerine dayanır. Bu yapı, verilerin değiştirilmesini zorlaştırır ve güvenilirliği artırır.', options: 'Yapılış biçimi, Dağıtılmış defter, Merkezsizleştirilmiş ağ, Hipermetin transfer protokolü' },
  { question: 'Blockchain Sorusu 2: Merkezsizleştirilmiş bir ağın avantajları nelerdir?', answer: 'Doğru Cevap :Merkezsizleştirilmiş bir ağ, tek bir merkezden bağımsız olarak çalışır. Bu, tek bir noktanın başarısız olması durumunda ağın devam edebilmesi anlamına gelir. Güvenilirlik, direnç ve esneklik sağlar.', options: 'Daha hızlı işlem, Tek bir noktada başarısızlık, Artan veri gizliliği, Daha düşük enerji tüketimi' },
  { question: 'Blockchain Sorusu 3: Kriptografi, blok zincirinde hangi rolü oynar?', answer: 'Doğru Cevap :Kriptografi, blok zincirinde verilerin güvenliği ve gizliliği için önemli bir rol oynar. Örneğin, her blok bir öncekinin hash değerini içerir. Bu, bloklar arasında güvenli bir bağlantı sağlar ve veri değişikliklerini tespit edebilir.', options: 'Veri şifreleme, İşlem doğrulama, Güvenli bağlantı, Dağıtılmış defter oluşturma' }
];


socket.emit('init');




setTimeout(() => {
  socket.emit('increaseScore');
  socket.emit('increaseTotalTime',2);
  console.log('increaseTotalTime olayı tetiklendi.');
}, 10000); // 10 saniye (10000 milisaniye) bekle
