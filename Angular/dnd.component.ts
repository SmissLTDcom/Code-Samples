import { Component, OnInit, Input } from '@angular/core';
import {NgbDropdownConfig} from '@ng-bootstrap/ng-bootstrap';
import {DndDropEvent} from 'ngx-drag-drop';
import { isUndefined } from 'util';

@Component({
  selector: 'app-dnd',
  templateUrl: './dnd.component.html',
  styleUrls: ['./dnd.component.scss']
})
export class DndComponent implements OnInit {

  @Input() list: any;
  @Input() callback = (list) => {};

  constructor(config: NgbDropdownConfig) {
    config.autoClose = false;
  }

  ngOnInit() {
  }

  onChange(index) {
    this.list[index].isActive = !(this.list[index].isActive);
    this.callback(this.list);
  }

  onDragged(item: any, list: any[], i: number) {
    this.callback(this.list);
  }

  onDrop(event: DndDropEvent, list: any[]) {
    let newIndex = event.index;
    const oldIndex = event.type;

    if ( isUndefined(newIndex) ) { 
      newIndex = list.length;
    }

    const draggedItem = list[oldIndex];
    list.splice(oldIndex, 1);
    list.splice(newIndex, 0, draggedItem);
  }

}
