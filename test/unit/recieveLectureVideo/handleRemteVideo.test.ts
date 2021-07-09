import LecturesLogicImpl from "@controller/BusinessLogic/Event/Lecture/lectures-logic-impl";

describe("handling recording at remote janus server", () => {
    it.skip("should list available lectures at remote server", async () => {
        const remote_files = await new LecturesLogicImpl().listRemoteRecordings();
        expect(remote_files.length > 1);
    });

    it.skip("should save video and return a path for it", async () => {
        const lectureLogic = new LecturesLogicImpl();
        const remote_files = await lectureLogic.listRemoteRecordings();
        const uuid = remote_files[0];

        expect(await lectureLogic.getRemoteRecording(uuid));
    });
});
