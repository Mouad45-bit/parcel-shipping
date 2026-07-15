package com.parcelshipping.shipments.storage;

import com.parcelshipping.shipments.config.ShipmentStorageProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Component
public class ShipmentPodStorage {

    private final Path root;

    public ShipmentPodStorage(
            ShipmentStorageProperties properties
    ) {
        this.root =
                properties
                        .podsRoot()
                        .toAbsolutePath()
                        .normalize();
    }

    @PostConstruct
    public void initialize() {
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to initialize the POD storage directory.",
                    exception
            );
        }
    }

    public String createStorageKey(
            UUID shipmentId,
            int position
    ) {
        if (shipmentId == null) {
            throw new IllegalArgumentException(
                    "shipmentId is required."
            );
        }

        if (
                position < 1
                        || position > 3
        ) {
            throw new IllegalArgumentException(
                    "POD position must be between 1 and 3."
            );
        }

        return "shipments/"
                + shipmentId
                + "/pods/pod-"
                + position
                + ".png";
    }

    public boolean exists(
            String storageKey
    ) {
        return Files.isRegularFile(
                resolve(storageKey)
        );
    }

    public void write(
            String storageKey,
            byte[] content
    ) {
        if (
                content == null
                        || content.length == 0
        ) {
            throw new IllegalArgumentException(
                    "POD content is required."
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
                            ".pod-",
                            ".tmp"
                    );

            Files.write(
                    temporaryFile,
                    content,
                    StandardOpenOption.TRUNCATE_EXISTING
            );

            moveAtomically(
                    temporaryFile,
                    target
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to persist the POD image.",
                    exception
            );
        } finally {
            if (temporaryFile != null) {
                try {
                    Files.deleteIfExists(
                            temporaryFile
                    );
                } catch (IOException ignored) {
                    // Le fichier cible a déjà été traité.
                }
            }
        }
    }

    public void deleteIfExists(
            String storageKey
    ) {
        try {
            Files.deleteIfExists(
                    resolve(storageKey)
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to remove the POD image.",
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
                Path.of(storageKey)
                        .normalize();

        if (
                relativePath.isAbsolute()
                        || relativePath.startsWith(
                                ".."
                        )
        ) {
            throw new IllegalArgumentException(
                    "Invalid POD storage key."
            );
        }

        Path resolved =
                root.resolve(relativePath)
                        .normalize();

        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException(
                    "POD storage key escapes the configured root."
            );
        }

        return resolved;
    }
}
