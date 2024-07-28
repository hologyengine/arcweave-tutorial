
import { Actor, AnimationState, AnimationStateMachine, AssetLoader, BaseActor, attach, inject } from "@hology/core/gameplay";
import { CharacterAnimationComponent, CharacterMovementComponent, CharacterMovementMode, ThirdPartyCameraComponent } from "@hology/core/gameplay/actors";
import { DialogueService } from "../services/dialogue-service";
import { hideWeapons } from "./npc";

@Actor()
class Character extends BaseActor {
  private animation = attach(CharacterAnimationComponent)
  public readonly movement = attach(CharacterMovementComponent, {
    maxSpeed: 1.5,
    maxSpeedSprint: 4,
    maxSpeedBackwards: 1,
    snapToGround: 0.1,
    autoStepMinWidth: 0,
    autoStepMaxHeight: 0.1,
    fallingReorientation: true,
    fallingMovementControl: 0.2,
    colliderHeight: .4,
    colliderRadius: 0.2,
    jumpVelocity: 3.5,
    offset: 0.01
  })
  public readonly thirdPartyCamera = attach(ThirdPartyCameraComponent, {
    height: .7,
    offsetX: 0,
    offsetZ: 0.2,
    minDistance: 3,
    maxDistance: 3,
    distance: 3,
  })

  private assetLoader = inject(AssetLoader)
  private dialogueService = inject(DialogueService)

  async onInit(): Promise<void> {
    const { scene, animations } = await this.assetLoader.getModelByAssetName('Rogue_Hooded')
    scene.scale.multiplyScalar(0.5)
    hideWeapons(scene)

    this.object.add(scene)

    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))
  
    const idle = new AnimationState(clips.Idle)
    const walk = new AnimationState(clips.Walking_A)
    const jump = new AnimationState(clips.Jump_Idle)
    const sprint = new AnimationState(clips.Running_A)

    idle.transitionsBetween(walk, () => this.movement.horizontalSpeed > 0)
    walk.transitionsBetween(sprint, () => this.movement.isSprinting)
    sprint.transitionsTo(idle, () => this.movement.horizontalSpeed == 0)
  
    for (const state of [idle, walk, sprint]) {
      state.transitionsBetween(jump, () => this.movement.mode === CharacterMovementMode.falling)
    }

    const sm = new AnimationStateMachine(idle)

    this.animation.setup(scene)
    this.animation.playStateMachine(sm)

    this.handleDialogues()
  }

  private handleDialogues() {
    let pointerLockElement: Element
    const unsubscribe = this.dialogueService.activeDialogue.subscribe(activeDialogue => {
      if (activeDialogue != null) {
        if (this.thirdPartyCamera.isMouseLocked) {
          pointerLockElement = window.document.pointerLockElement
          this.thirdPartyCamera.showCursor()
        }
      } else if (activeDialogue == null && pointerLockElement != null) {  
        this.thirdPartyCamera.hideCursor()
        pointerLockElement = null
      }
    })
    this.disposed.subscribe(() => unsubscribe())
  }

}

export default Character
