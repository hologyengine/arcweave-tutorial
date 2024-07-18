## Hology Arcweave Demo

This project demonstrates how [Arcweave](https://arcweave.com/) can be used with [Hology Engine](https://hology.app/).

[Try it here](https://hologyengine.github.io/arcweave-tutorial/)

### Dialogue Service

The DialogueService in `src/services/dialogue-service.ts` acts as an interface between the Arcwave story and user interface.

It imports the Arcweave data from the arcweave.json file and creates an ArcweaveStory instance.

It enables game play logic to start a dialogue and find the dialogues starting element using an `obj_id` defined by author on Arweave components and a `dialogue_start` attribute. 

It has a signal for the active dialogue to be used by the user interface to display the dialogue and options.

A method `selectOption` exists to select an option in the story based on the player's input.


### Dialogue Start Component

An actor component in `src/components/dialogue-start.ts` is attached to an NPC actor defined in `src/actors/npc.ts` which has a trigger volume to start a dialogue. It has a parameter for an `obj_id` so that you can connect the NPC actor instance to a character in the story. 

### Dialogue UI

The React component in `src/Dialogue.tsx` displays the current dialogue and option buttons for the player to click. 