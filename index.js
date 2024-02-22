const express = require('express');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const socketIo = require('socket.io');

const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(cors({ origin: 'http://localhost:3001' }));
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = socketIo(server);
const gameOver = 0;

let questions = [
    {
        question: "Nedir Blokchain?",
        options: [
            "Merkezi olmayan dağıtılmış bir defter teknolojisi",
            "Bir şirketin sahibi olduğu merkezi bir defter teknolojisi",
            "Yalnızca bankalar tarafından kullanılan bir ödeme sistemi",
            "Bir bilgisayar oyununun adı"
        ],
        answer: 0 
    },
    {
        question: "Blokchain'in temel özellikleri nelerdir?",
        options: [
            "Gizlilik, Merkeziyetçilik, Yüksek işlem ücretleri",
            "Güvenlik, Merkeziyetçilik, Düşük işlem hızı",
            "Merkeziyetçilik, Yüksek işlem ücretleri, Düşük güvenlik",
            "Güvenlik, Merkeziyetsizlik, İşlem şeffaflığı"
        ],
        answer: 3 
    },
    {
        question: "Blokchain'de blokların eklenme süreci nedir?",
        options: [
            "Madencilik",
            "Toplama",
            "Döküm",
            "Birleştirme"
        ],
        answer: 0 
    }
];
let users = {};
let currentQuestionIndex = 0;
let waiting = 0;
let init = 0;
let roomName = "tuNNcay";

io.on('connection', (socket) => {
    console.log('Bir istemci bağlandı.');
    socket.on('joinRoom', (room) => {
        socket.join(room); // İstemciyi belirli bir odaya katılması için ekliyoruz
    });
    socket.on('setParams', (params) => {
        socket.username = params.username;
        socket.score = 0;
        console.log('socket id:', socket.id);
        users[socket.id] = {
            username: socket.username,
            score: 0,
            time: 0
        };
        console.log(`Yeni parametreler alındı: username - ${socket.username}, score - ${socket.score}`);
        console.log('Kullanıcılar:', users);
    });
    socket.on('init', () => {
        questions;
        init = 1;
        io.to(roomName).emit('init', init);

        sendQuestion(socket);
    });
    socket.on('increaseScore', () => {
        if (users[socket.id]) {
            users[socket.id].score++;
            console.log(`${socket.username} adlı kullanıcının puanı artırıldı: Yeni Puan - ${users[socket.id].score}`);
        }
    });
    socket.on('increaseTotalTime', (userTime) => {
        if (users[socket.id]) {
            users[socket.id].time += userTime;
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        console.log('Bir istemci ayrıldı.');
        console.log('Kalan Kullanıcılar:', users);
    });
});

function sendQuestion(socket) {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        waiting = 0;
        io.to(roomName).emit('waiting', waiting);
        io.to(roomName).emit('question', currentQuestion);
      

        let countdown = 15;
        const countdownInterval = setInterval(() => {
            io.to(roomName).emit('countdown', countdown);
            countdown--;

            if (countdown < 0) {
                clearInterval(countdownInterval);
                io.to(roomName).emit('answer', currentQuestion.answer);
                waiting = 1;
                io.to(roomName).emit('waiting', waiting);
                setTimeout(() => {
                    currentQuestionIndex++;
                    sendQuestion(socket);
                }, 5000);
            }
        }, 1000);
    } else {
        io.to(roomName).emit('gameOver', 1);
        // pushdbQuiz();
            
        console.log(users);
    }
}

const getScore = (socket) => {
    if (users[socket.id]) {
        return users[socket.id].score;
    }
    return 0; // Kullanıcı odaya katılmamışsa 0 döndür
};

async function pushdbQuiz() {
    for (const userId in users) {
        if (users.hasOwnProperty(userId)) {
            const user = users[userId];
            const user_name = user.username;
            const score = user.score;
            const time = user.time;

            const post = await prisma.quiz_result.create({
                data: {
                    user_name: user.username,
                    user_score: user.score,
                    user_time: user.time
                },
            });
            console.log(`Kullanıcı Adı: ${user_name}, Puan: ${score}, Zaman: ${time}`);
        }
    }
}

server.listen(8000, () => {
    console.log('Sunucu dinleniyor: http://localhost:8000');
});