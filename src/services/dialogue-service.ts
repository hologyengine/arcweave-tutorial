import { Service } from "@hology/core/gameplay";
import { signal } from "@preact/signals-react"
import { ArcweaveStory, StoryOption } from "../arcweave/story";
import arcweaveProject from '../arcweave.json'


export type DialogueElement = {
  speakerName?: string
  content: string
  options: StoryOption[]
  end: boolean
}

@Service()
class DialogueService {
  readonly activeDialogue = signal<DialogueElement|null>(null)
  readonly story = new ArcweaveStory(arcweaveProject)

  startDialogue(objId: string) {
    const characterId = this.story.findComponentId({attribute: [{name: 'obj_id', value: objId}]})
    if (characterId == null) {
      console.error(`Could not find character with obj_id ${objId}`)
      return
    }
    const startElementId = this.story.findElementId({attribute: [{name: 'tag', value: 'dialogue_start'}], componentId: characterId})
    if (startElementId == null) {
      console.error(`Could not find dialogue start for character with obj_id ${objId}`)
      return
    }
    this.story.setCurrentElement(startElementId)
    this.updateActiveDialogue()
  }

  endDialogue() {
    this.activeDialogue.value = null
  }

  selectOption(path: StoryOption) {
    this.story.selectOption(path)
    this.updateActiveDialogue()
  }

  private updateActiveDialogue() {
    const element = this.story.getCurrentElement()
    this.activeDialogue.value = {
      speakerName: element.components.find(c => c.attributes['obj_id'] != null)?.name,
      content: element.content,
      options: element.options,
      end: element.attributes['tag'] === 'dialogue_end' || element.options.length === 0
    }
  }
}

export { DialogueService }