
import { Actor, AnimationState, AnimationStateMachine, attach, BaseActor, inject, Parameter } from "@hology/core/gameplay";
import { DialogueStartComponent } from "../components/dialogue-start";
import { CharacterAnimationComponent } from "@hology/core/gameplay/actors";
import { DialogueService } from "../services/dialogue-service";
import { Mesh, Object3D } from "three";

@Actor()
class Npc extends BaseActor {

  private dialogueStart = attach(DialogueStartComponent)
  private animation = attach(CharacterAnimationComponent)
  private dialogueService = inject(DialogueService)

  public health: number = 50

  @Parameter()
  private model: Object3D

  async onInit(): Promise<void> {
    hideWeapons(this.model)
    this.model.scale.multiplyScalar(0.5)
    
    const animations = this.model.animations
    this.object.add(this.model)

    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))  

    const idle = new AnimationState(clips.Idle)
    const sit = new AnimationState(clips.Lie_Pose)

    idle.transitionsBetween(sit, () => this.health < 40)
    
    const sm = new AnimationStateMachine(idle)

    this.animation.setup(this.model)
    this.animation.playStateMachine(sm)
  }

  onUpdate(): void {
    const variables = this.dialogueService.story.getVariables()
    if (this.dialogueStart.objId === 'WANDA') {
      this.health = variables['wanda_health'] as number
    }
  }

}

export default Npc

const objectsToRemove = [
  '1H_Wand', 
  '2H_Staff',
  'Throwable',
  'Knife',
  'Knife_Offhand',
  '1H_Crossbow',
  '2H_Crossbow',
  'Spellbook',
  'Spellbook_open',
]


export function hideWeapons(model: Object3D) {
  model?.traverseVisible(o => {
    if (o instanceof Mesh && objectsToRemove.includes(o.name)) {
      o.visible = false
    }
  })
}
