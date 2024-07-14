
import { Actor, attach, BaseActor } from "@hology/core/gameplay";
import { DialogueStartComponent } from "../components/dialogue-start";

@Actor()
class Npc extends BaseActor {

  private dialogueStart = attach(DialogueStartComponent)

  onInit(): void | Promise<void> {
    
  }

  onBeginPlay() {

  }

  onEndPlay() {

  }

}

export default Npc
