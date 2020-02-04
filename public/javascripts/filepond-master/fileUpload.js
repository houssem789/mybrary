// Register the plugin
FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
);

FilePond.setOptions({
  stylePanelAspecRatio: 150 / 100,
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150
});
//Turn all file input elements into ponds -->
FilePond.parse(document.body);
