import { Observer, Observable, Subject, Subscription } from "rxjs";
import { take, first, map } from "rxjs/operators";

class Work {
  //TS TODO: you will need to declare a 'broadcaster' with a type and access modified.
  private broadcaster: Subject<unknown>;

  constructor() {
    this.broadcaster = new Subject();
  }

  // broadcast stream
  public getBroadcaster(): Subject<unknown> {
    return this.broadcaster;
  }

  // individual income stream
  public getSalaryObservable(salary: number): Observable<number> {
    // This observable object will
    // notify observers via onNext, onError, onCompleted callbacks.
    // TS TODO: add parameter type
    return new Observable((observer) => {
      let paycheckcount: number = 0;

      const interval: number = setInterval(
        () => {
          paycheckcount++;
          if (salary > 10000) {
            // throw new Error('Not allowed.'); //this will halt the execution
            observer.error("The specified salary is too high");
          }

          // Broadcasting current stock price whenever someone receives a paycheck.
          this.broadcaster.next(
            "Our current stock value is: " + Math.random() * 400
          );

          // Sending a paycheck to the subscriber.
          observer.next(salary);

          console.log("Current paycheck count:" + paycheckcount);
        },
        // pause for 1000ms on each iteration of setInterval(...).
        1000
      );

      //returns an Instance of Subscription. http://reactivex.io/rxjs/class/es6/Subscription.js~Subscription.html
      return () => {
        console.log("Observer requested cancellation.");
        clearInterval(interval);
      };
      // Same as
      // return new Subscription(() => {
      // console.log('Observer requested cancellation.');
      // clearInterval(interval)});
    });
  }
}

//TS TODO: create an interface with all of the methods that 'Subscriber' needs.
interface SubscriberInterface {}

// TS TODO: implement the interface
class Subscriber {
  // TS TODO: add access modifiers and types
  private id: number;
  private savings: number;
  private loans: number;
  private salary: number;
  private salarySubscription: Subscription;

  constructor(id: number, salary: number, savings: number, loans: number) {
    this.id = id;
    this.salary = salary;
    this.savings = savings;
    this.loans = loans;
  }

  // Subscribes for broadcast messages
  // TS TODO: add parameter type(s) and return type ???
  public subscribeSubject(work: Work): void {
    work.getBroadcaster().subscribe(message => {
      console.log(this.id + " received a message: " + message);
    });
  }

  // TS TODO: add parameter type(s) and return type  ???
  public salaryHelperFunction(paycheck: number): void {
    this.savings = this.savings + paycheck;
    console.log(this.id + "'s" + " savings:$" + this.savings);

    if (this.savings + this.loans >= 0) {
      console.log(this.id + "'s loans are paid off!");
      this.stop();
    }
  }

  // Subscribes for individual messages (paychecks)
  // TS TODO: add parameter type(s) and return type
  public subscribeObservable(work): void {
    if (!this.salarySubscription)
      // TS TODO: add parameter type
      this.salarySubscription = work.getSalaryObservable(this.salary).subscribe(
        (paycheck: number) => this.salaryHelperFunction(paycheck), // first callback is for data
        err => console.log(err), // error
        () => console.log("Income stream ended.") // end of streaming.
      );
  }

  // ... limited takes
  // TS TODO: add parameter type(s) and return type
  public subscribeObservableWithTake(work: Work, takes: number): void {
    if (!this.salarySubscription)
      // TS TODO: add parameter type
      this.salarySubscription = work
        .getSalaryObservable(this.salary)
        .pipe(take(takes))
        .subscribe(
          (paycheck: number) => this.salaryHelperFunction(paycheck), // first callback is for data
          err => console.log(err), // error
          () => console.log("Income stream ended.") // end of streaming.
        );
  }

  // ... boosts paycheck by piping paycheck => paycheck * raise
  // TS TODO: add parameter type(s) and return type
  public subscribeObservableWithRaise(work: Work, raise: number): void {
    if (!this.salarySubscription)
      // TS TODO: add parameter type
      this.salarySubscription = work
        .getSalaryObservable(this.salary)
        .pipe(map((paycheck: number) => paycheck * raise))
        .subscribe(
          paycheck => this.salaryHelperFunction(paycheck), // first callback is for data
          err => console.log(err), // error
          () => console.log("Income stream ended.") // end of streaming.
        );
  }

  // ... multiple maps sequentially chained together
  // TS TODO: add parameter type(s) and return type
  public subscribeObservableWithRaiseAndTaxAndBills(work: Work, raise: number, taxrate: number, bills: number): void {
    if (!this.salarySubscription)
      // TS TODO: add parameter types
      this.salarySubscription = work
        .getSalaryObservable(this.salary)
        .pipe(
          map((paycheck: number) => paycheck * raise), // adjusting the paycheck for the raise
          map((paycheck: number) => paycheck * taxrate), // then tax
          map((paycheck: number) => paycheck - bills) // subtracting bills
          // TS TODO: add parameter type
        )
        .subscribe(
          (paycheck: number) => this.salaryHelperFunction(paycheck), // first callback is for data
          err => console.log(err), // error
          () => console.log("Income stream ended.") // end of streaming.
        );
  }

  // TS TODO: add return type
  stop() {
    if (this.salarySubscription) {
      this.salarySubscription.unsubscribe();
      this.salarySubscription = null;
    }
  }
}

const person1 = new Subscriber("ID_01", 3600, 100, -59000);

const person2 = new Subscriber("ID_02", 3400, 1000, -56000);

let work = new Work();

// uncomment below to see this program in action.

person1.subscribeObservable(work);
person2.subscribeSubject(work);
person2.subscribeObservableWithTake(work, 5);
person2.subscribeObservableWithRaise(work, 2.5);
//person1.subscribeObservableWithRaiseAndTaxAndBills(work, 1.25, 0.65, 1500);
