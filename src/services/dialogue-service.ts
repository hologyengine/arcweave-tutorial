import { Service } from "@hology/core/gameplay";
import { signal } from "@preact/signals-react"
import { ArcweaveStory, StoryPath } from "../arcweave/story";
import arcweaveProject from '../arcweave.json'


export type DialogueElement = {
  speakerName?: string
  content: string
  options: StoryPath[]
  end: boolean
}

@Service()
class DialogueService {
  readonly activeDialogue = signal<DialogueElement|null>(null)
  readonly story = new ArcweaveStory(arcweaveProject)

  startDialogue(startElementId: string) {
    this.story.setCurrentElement(startElementId)
    this.updateActiveDialogue()
  }

  endDialogue() {
    this.activeDialogue.value = null
  }

  selectPath(path: StoryPath) {
    this.story.selectPath(path)
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