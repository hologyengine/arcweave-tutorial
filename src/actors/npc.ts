
import { Actor, AnimationState, AnimationStateMachine, AssetLoader, attach, BaseActor, inject } from "@hology/core/gameplay";
import { DialogueStartComponent } from "../components/dialogue-start";
import { CharacterAnimationComponent } from "@hology/core/gameplay/actors";
import { DialogueService } from "../services/dialogue-service";

@Actor()
class Npc extends BaseActor {

  private dialogueStart = attach(DialogueStartComponent)
  private animation = attach(CharacterAnimationComponent)
  private assetLoader = inject(AssetLoader)
  private dialogueService = inject(DialogueService)

  public health: number = 50

  async onInit(): Promise<void> {
    const { scene, animations } = await this.assetLoader.getModelByAssetName('character-human')
    scene.traverse(o => o.castShadow = true)

    this.object.add(scene)

    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))  
    const idle = new AnimationState(clips.idle)
    const sit = new AnimationState(clips.sit)

    idle.transitionsBetween(sit, () => this.health < 40)
    
    const sm = new AnimationStateMachine(idle)

    this.animation.setup(scene)
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
