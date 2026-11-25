"""Package the TypeScript review sources and the three sanitized reading plans."""

import json
import re
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase4"
CASES = ("CS-005", "CS-126", "CS-127")
CREDENTIAL = re.compile(
    r"-----BEGIN [^-]*PRIVATE KEY-----|\bsk-(?:proj-)?[a-z0-9_-]{16,}"
    r"|\bAKIA[A-Z0-9]{16}\b|\bgh[pousr]_[a-z0-9]{20,}", re.IGNORECASE,
)
PERSONAL = re.compile(
    r'\d{4}-\d{2}-\d{2}|-?\b\d{11,13}\b|'
    r'"(?:birthInput|customerContext|customerReadingContext|birthplace|email|phone)"\s*:'
)
README = """FILUNE customer reading review

src/ contains the TypeScript reading pipeline, renderers and knowledge tables.
External dependencies and original expert-source documents are outside this archive.

plans/ contains three premium CustomerReadingPlan exports. Calendar instants
and embedded timestamps are replaced by ordered T tokens within each plan.
These are review snapshots. They cannot be used for date rendering.
No birth-input fixtures, app settings, credentials or environment files are included.
"""


def checked_text(path: Path) -> str:
    if path.is_symlink() or not path.resolve().is_relative_to(ROOT):
        raise ValueError(f"Unexpected external or linked review file: {path.name}")
    text = path.read_text(encoding="utf-8")
    if CREDENTIAL.search(text):
        raise ValueError(f"Credential-like content in {path.name}")
    return text


def main() -> None:
    sources = sorted((ROOT / "src" / "lib").rglob("*.ts"))
    sources += [
        ROOT / "src/components/BasicChartResult.tsx",
        ROOT / "src/components/result/PremiumResultPreview.tsx",
    ]
    with TemporaryDirectory(dir=ARTIFACTS) as directory:
        output = Path(directory) / "review.zip"
        with ZipFile(output, "w", ZIP_DEFLATED) as archive:
            archive.writestr("README.txt", README)
            for path in sources:
                archive.writestr(path.relative_to(ROOT).as_posix(), checked_text(path))
            for case_id in CASES:
                body = checked_text(ARTIFACTS / "review-plans" / f"{case_id}.json")
                if PERSONAL.search(body) or len(json.loads(body)["chapterGroups"]) != 7:
                    raise ValueError(f"Unexpected personal data or plan shape in {case_id}")
                archive.writestr(f"plans/{case_id}.json", body)
        with ZipFile(output) as archive:
            expected = {"README.txt", *(f"plans/{case_id}.json" for case_id in CASES)}
            expected.update(path.relative_to(ROOT).as_posix() for path in sources)
            if set(archive.namelist()) != expected or archive.testzip() is not None:
                raise ValueError("Review ZIP content check failed")
        output.replace(ARTIFACTS / "FILUNE-reading-review.zip")
    print(f"Verified {len(expected)} ZIP members.")


if __name__ == "__main__":
    main()
