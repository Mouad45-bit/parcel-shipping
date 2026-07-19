package com.parcelshipping.shipments.storage;

import com.parcelshipping.shipments.config.ShipmentStorageProperties;
import com.parcelshipping.shipments.error.ShipmentExportFileNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class ShipmentExportStorage {

    private static final long MAXIMUM_EXPORT_SIZE =
            50L * 1024L * 1024L;

    private final Path root;

    public ShipmentExportStorage(
            ShipmentStorageProperties properties
    ) {
        this.root =
                properties
                        .exportsRoot()
                        .toAbsolutePath()
                        .normalize();
    }

    @PostConstruct
    public void initialize() {
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to initialize the export storage directory.",
                    exception
            );
        }
    }

    public String createStorageKey(
            UUID shipmentId,
            Instant generatedAt
    ) {
        if (shipmentId == null) {
            throw new IllegalArgumentException(
                    "shipmentId is required."
            );
        }

        if (generatedAt == null) {
            throw new IllegalArgumentException(
                    "generatedAt is required."
            );
        }

        return "shipments/"
                + shipmentId
                + "/exports/pod-export-"
                + DateTimeFormatter
                .ISO_INSTANT
                .format(generatedAt)
                .replace(":", "")
                + "-"
                + UUID.randomUUID()
                + ".pdf";
    }

    public void write(
            String storageKey,
            byte[] content
    ) {
        if (
                content == null
                        || content.length == 0
                        || content.length > MAXIMUM_EXPORT_SIZE
        ) {
            throw new IllegalArgumentException(
                    "Invalid export content."
            );
        }

        Path target = resolve(storageKey);
        Path parent = target.getParent();
        Path temporaryFile = null;

        try {
            Files.createDirectories(parent);
            temporaryFile =
                    Files.createTempFile(
                            parent,
                            ".export-",
                            ".tmp"
                    );

            Files.write(
                    temporaryFile,
                    content,
                    StandardOpenOption.TRUNCATE_EXISTING
            );

            moveAtomically(temporaryFile, target);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to persist the export file.",
                    exception
            );
        } finally {
            if (temporaryFile != null) {
                try {
                    Files.deleteIfExists(temporaryFile);
                } catch (IOException ignored) {
                    // Le fichier temporaire a déjà été déplacé ou nettoyé.
                }
            }
        }
    }

    public byte[] read(
            String storageKey
    ) {
        Path source = resolve(storageKey);

        try {
            if (!Files.isRegularFile(source)) {
                throw new ShipmentExportFileNotFoundException();
            }

            long size = Files.size(source);

            if (
                    size <= 0
                            || size > MAXIMUM_EXPORT_SIZE
            ) {
                throw new IllegalStateException(
                        "Invalid export file size."
                );
            }

            return Files.readAllBytes(source);
        } catch (
                ShipmentExportFileNotFoundException exception
        ) {
            throw exception;
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to read the export file.",
                    exception
            );
        }
    }

    public void deleteIfExists(
            String storageKey
    ) {
        try {
            Files.deleteIfExists(resolve(storageKey));
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to remove the export file.",
                    exception
            );
        }
    }

    private void moveAtomically(
            Path source,
            Path target
    ) throws IOException {
        try {
            Files.move(
                    source,
                    target,
                    StandardCopyOption.ATOMIC_MOVE,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (
                AtomicMoveNotSupportedException exception
        ) {
            Files.move(
                    source,
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }
    }

    private Path resolve(
            String storageKey
    ) {
        if (
                storageKey == null
                        || storageKey.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "storageKey is required."
            );
        }

        Path relativePath =
                Path.of(storageKey).normalize();

        if (
                relativePath.isAbsolute()
                        || relativePath.startsWith("..")
        ) {
            throw new IllegalArgumentException(
                    "Invalid export storage key."
            );
        }

        Path resolved =
                root.resolve(relativePath)
                        .normalize();

        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException(
                    "Export storage key escapes the configured root."
            );
        }

        return resolved;
    }
}
