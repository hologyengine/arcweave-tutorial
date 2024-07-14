import { ActorComponent, attach, Component, inject, Parameter } from "@hology/core/gameplay";
import { TriggerVolumeComponent } from "@hology/core/gameplay/actors";
import Character from "../actors/character";
import { DialogueService } from "../services/dialogue-services";


@Component()
class DialogueStartComponent extends ActorComponent {

  @Parameter() // TODO Make parameters required if they don't have default value or marked as nullable
  public objId: string

  private triggerVolume = attach(TriggerVolumeComponent, {})
  private dialogueService = inject(DialogueService)

  onBeginPlay(): void {
    // TODO Get the active player to filter the actor instance to use. 
    this.triggerVolume.onBeginOverlapWithActorType(Character).subscribe(character => {
      console.log("Start dialogue with ", character)
      const characterId = this.dialogueService.story.findComponentId({attribute: [{name: 'obj_id', value: this.objId}]})
      if (characterId == null) {
        console.error(`Could not find character id ${this.objId}`)
        return
      }
      const startElementId = this.dialogueService.story.findElementId({attribute: [{name: 'tag', value: 'dialogue_start'}], componentId: characterId})
      if (startElementId == null) {
        console.error(`Could not find dialogue start for character ${this.objId}`)
        return
      }
      this.dialogueService.startDialogue(startElementId)
    })

    this.triggerVolume.onEndOverlapWithActorType(Character).subscribe(character => {
      console.log("End dialogue with ", character)
    })
  }

}

export { DialogueStartComponent }