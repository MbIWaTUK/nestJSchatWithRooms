Vue.component("alerts-component", VueSimpleNotify.VueSimpleNotify);
var app = new Vue ({
    el:"#v-app",
    data: {
        username: "",
        text: "",
        messages: {
            general: [],
            typescript: [],
            nestjs: []
        },
        rooms: {
            general: false,
            typescript: false,
            nestjs: false
        },
        socket: { chat: null, alerts: null},
        alerts: [],
        activeRoom: 'general'
    },
    methods: {
        sendChatMessage(){
                if (this.isMemberOfActiveRoom){
                    this.socket.chat.emit("chatToServer", {sender: this.username ,message: this.text, room: this.activeRoom});
                    this.text = "";
                }else{
                    alert('Вы не вошли ни в одну комнату');
                }              
        }, 
        receivedChatMessage(message){
            this.messages[message.room].push(message);
        },
        receiveAlertMessage(message){
            this.alerts.push(message);
        },
        toggleRoomMembership() {
            if (this.isMemberOfActiveRoom){
                this.socket.chat.emit('leaveRoom', this.activeRoom);
            }else {
                this.socket.chat.emit('joinRoom', this.activeRoom);
            }
        }
    },
    computed: {
        isMemberOfActiveRoom(){
            return this.rooms[this.activeRoom];
        }
    },
    created() {
        this.username = prompt ('Введите никнейм:');
        this.socket.chat = io("http://localhost:3000/chat")
        this.socket.chat.on("chatToClient", (message) => {
            this.receivedChatMessage(message);
        });
        this.socket.chat.on('connect', ()  => {
            this.toggleRoomMembership();
        });

        this.socket.chat.on('joinedRoom', (room) => {
            this.rooms[room] = true;
        });

        this.socket.chat.on('leftRoom', (room) => {
            this.rooms[room] = false;
        });

        this.socket.alerts = io('http://localhost:3000/alerts');
        this.socket.alerts.on("alertToClient", (message) => {
            this.receiveAlertMessage(message);
        });
    }
});
