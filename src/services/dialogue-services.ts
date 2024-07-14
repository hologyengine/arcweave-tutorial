import { Service } from "@hology/core/gameplay";
import { signal } from "@preact/signals-react"
import { ArcweaveStory, StoryPath } from "../arcweave/story";
import arcweaveProject from '../arcweave.json'


export type DialogueElement = {
  content: string
  options: StoryPath[]
}

@Service()
class DialogueService {
  readonly activeDialogue = signal<DialogueElement>(null)
  readonly story = new ArcweaveStory(arcweaveProject)

  startDialogue(startElementId: string) {
    this.story.setCurrentElement(startElementId)
    this.updateActiveDialogue()
  }

  endDialogue() {
    this.activeDialogue.value = null
  }

  // TODO handle saving and such.

  selectPath(path: StoryPath) {
    this.story.selectPath(path)
    this.updateActiveDialogue()
  }

  private updateActiveDialogue() {
    const element = this.story.getCurrentElement()
    this.activeDialogue.value = {
      content: element.content,
      options: this.story.getCurrentOptions()
    }
    console.log(this.activeDialogue.value)
  }
}

export { DialogueService }