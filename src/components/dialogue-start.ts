import { ActorComponent, attach, Component, inject, Parameter } from "@hology/core/gameplay";
import { TriggerVolumeComponent } from "@hology/core/gameplay/actors";
import Character from "../actors/character";
import { DialogueService } from "../services/dialogue-service";
import { Vector3 } from "three";


@Component()
class DialogueStartComponent extends ActorComponent {

  @Parameter()
  public objId: string

  private triggerVolume = attach(TriggerVolumeComponent, { dimensions: new Vector3(2, 2, 2) })
  private dialogueService = inject(DialogueService)

  onBeginPlay(): void {
    this.triggerVolume.onBeginOverlapWithActorType(Character).subscribe(() => {
      this.dialogueService.startDialogue(this.objId)
    })

    this.triggerVolume.onEndOverlapWithActorType(Character).subscribe(() => {
      this.dialogueService.endDialogue()
    })
  }

}

export { DialogueStartComponent }