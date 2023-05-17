import { Component, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import {QuestionComponent} from "../question/question.component";


@Component({
  selector: 'app-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.css']
})

//TODO: Implement Admin Page to Start/Stop the flow [Game master]
export class TriggerComponent {
  //Child Reference
  @ViewChild(QuestionComponent) childRef: QuestionComponent


  //TIMER FOR TRIGGER OF QUESTIONS
  //I would say (30, 120) for the official game | change it for testing purposes
  timeLeft = this.randomNumber(10, 15);

  interval;
  displayTrigger = false;
  constructor() {
    this.displayTrigger = false;
    this.startTimer();
  }

  //Referencing of Child's method
  destroyChild() {
    if (this.childRef) {
      this.childRef.deleteQuestion();
    }
  }
  randomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  startTimer() {
    this.interval = setInterval(() => {
      console.log(this.timeLeft);
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        //time ran out, trigger new question
        if(this.childRef) {
          this.childRef.newQuestion();
        }
        this.displayTrigger = true;
        this.timeLeft = this.randomNumber(30, 120);

      }
    },1000)
  }

  pauseTimer() {
    clearInterval(this.interval);
  }


  // <button (click)='startTimer()'>Start Timer</button>
  // <button (click)='pauseTimer()'>Pause</button>
  //
  //   <p>{{timeLeft}} Seconds Left....</p>

}
