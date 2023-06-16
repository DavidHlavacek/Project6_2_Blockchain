import { Component } from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/compat/database";
import {FireConectionService} from "../fire-conection.service";
import {Observable, of, Subscription, timer} from "rxjs";
import {Player} from "../../player";
import {OrdersComponent} from "../orders/orders.component";
import {Router} from "@angular/router";

@Component({
  selector: 'supplychain-classic',
  templateUrl: './supplychain-classic.html',
  styleUrls: ['./supplychain-classic.component.css']
})

export class SupplychainClassicComponent {
  dataBase : AngularFireDatabase;
  orderData$: Observable<any[]> = of([]);
  orderData : any[] | undefined;
  moneyData$: Observable<any[]> = of([]);
  moneyData : any[] | undefined;
  moneyDataSubscription: Subscription | undefined;
  orderDataSubscription: Subscription | undefined;
  messagesSubscription: Subscription | undefined;
  timerSubscription : Subscription | undefined;
  messages: any[] = [];
  randomTimer: number | undefined;
  randomTimerData: any[] | undefined;
  currentRole : string = "";
  value : any | undefined;
  showGM: boolean = false;
  showStore: boolean = false;
  showFinancier: boolean = false;
  showManufacturer: boolean = false;
  showShipper: boolean = false;
  storeMoney : number = 0;
  manufactureMoney : number = 0;
  orderCount : number = 0;
  orderPrice : number = 0;

  constructor(private db: AngularFireDatabase, private fireConnectionService: FireConectionService, private router: Router) {
    //initialize database
    this.dataBase = db;
  }

  retrieveGameData(){
    //create the reference towards the data list
    const orderRef = this.db.list("orders");
    //define the table as the data of the users table
    this.orderData$ = orderRef.valueChanges();

    //if the data subscription is not subbed yet then sub
    if(!this.orderDataSubscription){
      this.orderDataSubscription = this.orderData$.subscribe((orderData) => {
        //update method
        this.orderData = orderData;

        if(this.orderData){
          let inCounter = 0
          this.orderData.forEach((order) => {
            if(inCounter == this.orderCount){
              this.orderPrice = order.price;
            } else {
              inCounter++;
            }
          })
        }
      });
    }

    //create the reference towards the data list
    const moneyRef = this.db.list("money");
    //define the table as the data of the users table
    this.moneyData$ = moneyRef.valueChanges();

    //if the data subscription is not subbed yet then sub
    if(!this.moneyDataSubscription){
      this.moneyDataSubscription = this.moneyData$.subscribe((moneyData) => {
        //update method
        this.moneyData = moneyData;

        if(this.moneyData){
          this.moneyData.forEach((money) => {
            if(money.role == "store"){
              this.storeMoney = money.money;
            } else {
              this.manufactureMoney = money.money;
            }
          })
        }
      });
    }
    this.messagesSubscription = this.fireConnectionService.getMessagesFromDatabase().subscribe(
      (items: any[]) => {
        this.messages = items;
      }
    );
    this.timerSubscription = this.fireConnectionService.getTimerFromDatabase().subscribe(
      (timerData: any[]) => {
        this.randomTimerData = timerData;
        if(this.randomTimerData) {
          this.randomTimerData.forEach((timer) => {
            this.randomTimer = timer;
              console.log(this.randomTimer);
            })
          }
        }
    );
  }

  async ngOnInit() {
    //removes the node when the user leaves the webpage or disconnects
    this.fireConnectionService.deleteUserNodeOnDisconnect();
    this.fireConnectionService.deleteMessageNodeOnDisconnect();
    this.fireConnectionService.deleteMoneyOnDisconnect();
    this.fireConnectionService.deleteTimerOnDisconnect();
    //retrieve and subscribe to user data table
    this.value = Player.getInstance().role;
    switch (this.value) {
      case "buyer":
        this.showGM = true;
        this.currentRole = this.value;
        break;

      case "store":
        this.showStore = true;
        this.currentRole = this.value;
        this.fireConnectionService.createMoneyNode(500, "store");
        break;

      case "financier":
        this.showFinancier = true;
        this.currentRole = this.value;
        break;

      case "manufacturer":
        this.showManufacturer = true;
        this.currentRole = this.value;
        this.fireConnectionService.createMoneyNode(500, "manufacturer");
        break;

      case "shipper":
        this.showShipper = true;
        this.currentRole = this.value;
        break;
    }
    this.retrieveGameData();
    this.startGameTimer();
  }
  titles = 'SupplyChain';
  // @ts-ignore
  senderFinancier : any;
  // @ts-ignore
  senderStore: any;
  // @ts-ignore
  senderManufacturer: any;
  // @ts-ignore
  senderShipper: any;

  goodNumber : number = 0;
  badNumber : number = 0;

  pushTextWithRole(text: string, role: string) {
    if(role == "buyer"){
      this.storeMoney += this.orderPrice;
      this.fireConnectionService.updateMoney({money: this.storeMoney}, "store");
    } else {
      this.storeMoney += this.orderPrice;
      this.fireConnectionService.updateMoney({money: this.storeMoney}, "manufacturer");    }
    // @ts-ignore
    let textToSend = this[text];
    console.log(text);
    // @ts-ignore
    this[text] = '';
    this.fireConnectionService.addTextToDatabase(textToSend, role);

  }

  storeToManufacturer(text: string, role: string) {
    this.pushTextWithRole(text, role);

    let manufMoney = this.manufactureMoney;
    manufMoney += (this.orderPrice * 0.8);

    this.fireConnectionService.updateMoney({money: manufMoney}, "manufacturer");
  }
  isMessageVisible(item?: any): boolean {
    // Check if the user's role allows viewing the item
    return this.currentRole === item.role;
  }
  gameTimeMin: number = 10;
  gameTimeSec: number = 0;
  intervalId: any;
  startGameTimer()
  {
    this.intervalId = setInterval(() => {
      if (this.gameTimeMin == 0 && this.gameTimeSec == 1) {
        clearInterval(this.intervalId);
        // Unsubscribe from any existing timer subscription
        this.timerSubscription?.unsubscribe();

        this.timerSubscription = timer(1000).subscribe(() => {
          this.router.navigate(['end-game']);
        });
      }
      if(this.gameTimeSec == 0)
      {
        this.gameTimeMin--;
        this.gameTimeSec = 59;
      }
      else
      {
        this.gameTimeSec--;
      }
    }, 1000);
  }
}
